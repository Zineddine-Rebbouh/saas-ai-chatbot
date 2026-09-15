'use client'
import { useSettings } from '@/hooks/settings/use-settings'
import React from 'react'
import { DomainUpdate } from './domain-update'
import CodeSnippet from './code-snippet'
import PremiumBadge from '@/icons/premium-badge'
import EditChatbotIcon from './edit-chatbot-icon'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const WelcomeMessage = dynamic(
  () => import('./greetings-message').then((props) => props.default),
  {
    ssr: false,
  }
)

type Props = {
  id: string
  name: string
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  chatBot: {
    id: string
    icon: string | null
    welcomeMessage: string | null
  } | null
}

const SettingsForm = ({ id, name, chatBot, plan }: Props) => {
  const {
    register,
    onUpdateSettings,
    errors,
    onDeleteDomain,
    deleting,
    loading,
  } = useSettings(id)

  return (
    <form
      className="flex flex-col gap-6 pb-10"
      onSubmit={onUpdateSettings}
    >
      {/* ── Domain Settings Card ── */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 bg-gradient-to-r from-primary/5 via-primary/[0.03] to-transparent flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_2px] shadow-primary/50 shrink-0" />
          <h2 className="font-semibold text-base tracking-tight">Domain Settings</h2>
        </div>
        <div className="px-6 py-6 flex flex-col gap-6">
          <DomainUpdate name={name} register={register} errors={errors} />
          <CodeSnippet id={id} />
        </div>
      </div>

      {/* ── Chatbot Settings Card ── */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 bg-gradient-to-r from-violet-500/5 via-primary/[0.03] to-transparent flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_2px] shadow-violet-500/50 shrink-0" />
          <h2 className="font-semibold text-base tracking-tight">Chatbot Settings</h2>
          <span className="ml-1 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400/20 to-orange-400/20 border border-amber-400/30 rounded-full px-2.5 py-0.5 text-xs font-semibold text-amber-500 select-none">
            <PremiumBadge />
            Premium
          </span>
        </div>
        <div className="px-6 py-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="col-span-1 flex flex-col gap-6 order-last md:order-first">
              <EditChatbotIcon chatBot={chatBot} register={register} errors={errors} />
              <WelcomeMessage
                message={chatBot?.welcomeMessage!}
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1 relative">
              <Image
                src="/images/bot-ui.png"
                className="sticky top-0 rounded-xl drop-shadow-md"
                alt="bot-ui"
                width={530}
                height={769}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex gap-3 justify-end items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              type="button"
              className="h-11 px-6 border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive/70 transition-all font-semibold rounded-xl"
            >
              <Loader loading={deleting}>Delete Domain</Loader>
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="rounded-2xl border border-border/60 shadow-2xl gap-5">
            <AlertDialogHeader className="gap-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <AlertDialogTitle className="text-lg font-semibold">Delete this domain?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed">
                This permanently removes the domain and all chatbot settings.
                This action{' '}
                <span className="font-semibold text-foreground">cannot be undone</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="rounded-xl h-10 font-medium">Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  variant="destructive"
                  disabled={deleting}
                  onClick={onDeleteDomain}
                  className="rounded-xl h-10 px-6 font-semibold"
                >
                  <Loader loading={deleting}>Delete Domain</Loader>
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          type="submit"
          className="h-11 px-8 font-semibold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <Loader loading={loading}>Save Changes</Loader>
        </Button>
      </div>
    </form>
  )
}

export default SettingsForm
