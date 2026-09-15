'use server'

import { client } from '@/lib/prisma'
import { extractEmailsFromString, extractURLfromString, getAppUrl } from '@/lib/utils'
import { emitRealtime } from '@/lib/realtime'
import { clerkClient } from '@clerk/nextjs/server'
import { onMailer } from '../mailer'

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash'

// Minimal Gemini chat helper (native fetch, no extra deps).
// Maps OpenAI-style { role: 'assistant' | 'user', content } history to
// Gemini's { role: 'model' | 'user', parts } format.
const geminiChat = async (
  systemPrompt: string,
  history: { role: 'assistant' | 'user'; content: string }[],
  message: string
): Promise<string> => {
  const contents = [
    ...history.map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ]

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
      }),
    }
  )

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// Internal helper (not exported — not callable as a server action).
const storeConversation = async (
  id: string,
  message: string,
  role: 'assistant' | 'user'
) => {
  await client.chatRoom.update({
    where: {
      id,
    },
    data: {
      message: {
        create: {
          message,
          role,
        },
      },
    },
  })
}

export const onGetCurrentChatBot = async (id: string) => {
  try {
    if (!id) return null
    const chatbot = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        helpdesk: true,
        name: true,
        chatBot: {
          select: {
            id: true,
            welcomeMessage: true,
            icon: true,
            textColor: true,
            background: true,
            helpdesk: true,
          },
        },
      },
    })

    return chatbot ?? null
  } catch (error) {
    console.log(error)
    return null
  }
}

export const onAiChatBotAssistant = async (
  id: string,
  chat: { role: 'assistant' | 'user'; content: string }[],
  author: 'user',
  message: string
) => {
  try {
    if (!id || !message || typeof message !== 'string') return
    const history = Array.isArray(chat) ? chat : []

    // Local to this invocation — never module state (module globals leak
    // across concurrent requests on the server).
    const extractedEmail = extractEmailsFromString(message)
    const customerEmail = extractedEmail?.[0]?.toLowerCase()

    // Single query: domain config + owner + matching customer. Exact,
    // case-insensitive email match so `a@b.co` never collides with
    // `a@b.co.evil.com` (the old `startsWith` did).
    const chatBotDomain = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        User: {
          select: {
            clerkId: true,
          },
        },
        filterQuestions: {
          where: {
            answered: null,
          },
          select: {
            question: true,
          },
        },
        customer: customerEmail
          ? {
              where: {
                email: {
                  equals: customerEmail,
                  mode: 'insensitive',
                },
              },
              select: {
                id: true,
                email: true,
                questions: true,
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                    mailed: true,
                  },
                },
              },
            }
          : {
              take: 0,
              select: {
                id: true,
                email: true,
                questions: true,
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                    mailed: true,
                  },
                },
              },
            },
      },
    })
    if (chatBotDomain) {
      if (customerEmail) {
        const existing = chatBotDomain.customer[0]
        if (!existing) {
          const newCustomer = await client.domain.update({
            where: {
              id,
            },
            data: {
              customer: {
                create: {
                  email: customerEmail,
                  questions: {
                    create: chatBotDomain.filterQuestions,
                  },
                  chatRoom: {
                    create: {},
                  },
                },
              },
            },
          })
          if (newCustomer) {
            const response = {
              role: 'assistant',
              content: `Welcome aboard ${
                customerEmail.split('@')[0]
              }! I'm glad to connect with you. Is there anything you need help with?`,
            }
            return { response }
          }
          return
        }
        let room = existing.chatRoom[0]
        if (!room) {
          // Self-repair: customer without a room (shouldn't happen).
          const repaired = await client.customer.update({
            where: { id: existing.id },
            data: { chatRoom: { create: {} } },
            select: {
              chatRoom: { select: { id: true, live: true, mailed: true } },
            },
          })
          room = repaired.chatRoom[0]
          if (!room) return
        }
        if (room.live) {
          await storeConversation(room.id, message, author)

          await emitRealtime(room.id, message, 'user', author)

          if (!room.mailed) {
            const user = await clerkClient.users.getUser(
              chatBotDomain.User?.clerkId!
            )

            await onMailer(user.emailAddresses[0].emailAddress)

            //update mail status to prevent spamming
            const mailed = await client.chatRoom.update({
              where: {
                id: room.id,
              },
              data: {
                mailed: true,
              },
            })

            if (mailed) {
              return {
                live: true,
                chatRoom: room.id,
              }
            }
          }
          return {
            live: true,
            chatRoom: room.id,
          }
        }

        await storeConversation(room.id, message, author)

        const appUrl = getAppUrl()
        const systemPrompt = `
              You will get an array of questions that you must ask the customer. 
              
              Progress the conversation using those questions. 
              
              Whenever you ask a question from the array i need you to add a keyword at the end of the question (complete) this keyword is extremely important. 
              
              Do not forget it.

              only add this keyword when your asking a question from the array of questions. No other question satisfies this condition

              Always maintain character and stay respectfull.

              The array of questions : [${chatBotDomain.filterQuestions
                .map((questions) => questions.question)
                .join(', ')}]

              if the customer says something out of context or inapporpriate. Simply say this is beyond you and you will get a real user to continue the conversation. And add a keyword (realtime) at the end.

              if the customer agrees to book an appointment send them this link ${appUrl}/portal/${id}/appointment/${existing.id}

              if the customer wants to buy a product redirect them to the payment page ${appUrl}/portal/${id}/payment/${existing.id}
          `
        const reply = await geminiChat(systemPrompt, history, message)

        if (reply?.includes('(realtime)')) {
          const realtime = await client.chatRoom.update({
            where: {
              id: room.id,
            },
            data: {
              live: true,
            },
          })

          if (realtime) {
            const response = {
              role: 'assistant',
              content: reply.replace('(realtime)', ''),
            }

            await storeConversation(room.id, response.content, 'assistant')

            return { response }
          }
        }
        if (
          history.length > 0 &&
          history[history.length - 1]?.content.includes('(complete)')
        ) {
          const firstUnansweredQuestion =
            await client.customerResponses.findFirst({
              where: {
                customerId: existing.id,
                answered: null,
              },
              select: {
                id: true,
              },
              orderBy: {
                question: 'asc',
              },
            })
          if (firstUnansweredQuestion) {
            await client.customerResponses.update({
              where: {
                id: firstUnansweredQuestion.id,
              },
              data: {
                answered: message,
              },
            })
          }
        }

        if (reply) {
          const generatedLink = extractURLfromString(reply)

          if (generatedLink) {
            const link = generatedLink[0]
            const response = {
              role: 'assistant',
              content: `Great! you can follow the link to proceed`,
              link: link.slice(0, -1),
            }

            await storeConversation(
              room.id,
              `${response.content} ${response.link}`,
              'assistant'
            )

            return { response }
          }

          const response = {
            role: 'assistant',
            content: reply,
          }

          await storeConversation(room.id, `${response.content}`, 'assistant')

          return { response }
        }
      }
      const reply = await geminiChat(
        `
            You are a highly knowledgeable and experienced sales representative for a ${chatBotDomain.name} that offers a valuable product or service. Your goal is to have a natural, human-like conversation with the customer in order to understand their needs, provide relevant information, and ultimately guide them towards making a purchase or redirect them to a link if they havent provided all relevant information.
            Right now you are talking to a customer for the first time. Start by giving them a warm welcome on behalf of ${chatBotDomain.name} and make them feel welcomed.

            Your next task is lead the conversation naturally to get the customers email address. Be respectful and never break character

          `,
        history,
        message
      )

      if (reply) {
        const response = {
          role: 'assistant',
          content: reply,
        }

        return { response }
      }
    }
  } catch (error) {
    console.log(error)
  }
}
