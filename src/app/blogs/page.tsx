import { onGetBlogPosts } from '@/actions/landing'
import { getMonthName } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on AI, marketing, and growing your business.',
}

const BlogsPage = async () => {
  const posts = await onGetBlogPosts()

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-6 pt-16 pb-12">
        <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-3">
          From the blog
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Insights on AI, marketing, and growing your business.
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <section className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                href={`/blogs/${post.id}`}
                key={post.id}
                className="group"
              >
                <article className="bg-card border border-border rounded-2xl overflow-hidden hover:border-border/80 transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
                  <div className="relative w-full aspect-video overflow-hidden">
                    <Image
                      src={
                        post.image.startsWith('/')
                          ? post.image
                          : `${process.env.CLOUDWAYS_UPLOADS_URL}${post.image}`
                      }
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <p className="text-xs text-muted-foreground">
                      {getMonthName(post.createdAt.getMonth())}{' '}
                      {post.createdAt.getDate()}, {post.createdAt.getFullYear()}
                    </p>
                    <h2 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors duration-150">
                      {post.title}
                    </h2>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {post.content
                        .replace(/<[^>]*>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .slice(0, 120)}
                      ...
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="container mx-auto px-6 text-center py-20 text-muted-foreground">
          No posts yet — check back soon.
        </div>
      )}
    </main>
  )
}

export default BlogsPage