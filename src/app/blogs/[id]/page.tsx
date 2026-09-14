import { onGetBlogPost } from '@/actions/landing'
import { CardDescription } from '@/components/ui/card'
import { getMonthName } from '@/lib/utils'
import parse from 'html-react-parser'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import React from 'react'

type Props = { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await onGetBlogPost(params.id)
  return {
    title: post ? `${post.title} — Blog` : 'Blog post',
    description: post?.content
      ? post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
      : undefined,
  }
}

const PostPage = async ({ params }: Props) => {
  const post = await onGetBlogPost(params.id)
  // Unknown/invalid id (or unreachable API with no mock match) → real 404
  if (!post) notFound()
  const { createdAt, title, content } = post

  return (
    <div className="container flex justify-center my-10">
      <div className="lg:w-6/12 flex flex-col">
        <CardDescription>
          {getMonthName(createdAt.getMonth())} {createdAt.getDate()}{' '}
          {createdAt.getFullYear()}
        </CardDescription>
        <h2 className="text-6xl font-bold">{title}</h2>
        <div className="text-xl parsed-container flex flex-col mt-10 gap-10">
          {parse(content)}
        </div>
      </div>
    </div>
  )
}

export default PostPage
