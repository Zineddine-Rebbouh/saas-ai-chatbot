'use server'

const MOCK_POSTS = [
  {
    id: '1',
    title: 'Boost Your Sales with AI Chatbots',
    image: '/images/blog-posts.jpg',
    content: '<p>Artificial intelligence is transforming how businesses interact with customers. Implementing an AI chatbot can boost your engagement and conversion rates by providing 24/7 instant support. Start using automated sales agents today to automatically qualify leads, handle customer service, and streamline booking.</p>',
    createdAt: new Date('2024-05-10T12:00:00Z'),
  },
  {
    id: '2',
    title: '10 Tips for Seamless Customer Support Integration',
    image: '/images/blog-post-2.jpg',
    content: '<p>Seamless customer support is vital for retaining users. Discover how to integrate automated support helpers into your landing page and dashboard to assist visitors instantly. Learn about setting up triggers, context-aware prompts, and matching the chatbot design to your brand guidelines.</p>',
    createdAt: new Date('2024-05-12T14:30:00Z'),
  },
  {
    id: '3',
    title: 'Automating Email Marketing with AI Solutions',
    image: '/images/blog-post-3.jpg',
    content: '<p>Leverage machine learning and automated workflows to target your readers at the perfect time. Learn how integrated AI solutions optimize your outreach campaigns, write compelling copy, and automatically track click-through rates to increase engagement.</p>',
    createdAt: new Date('2024-05-15T09:15:00Z'),
  }
]

export const onGetBlogPosts = async () => {
  try {
    const postArray: {
      id: string
      title: string
      image: string
      content: string
      createdAt: Date
    }[] = []
    const postsUrl = process.env.CLOUDWAYS_POSTS_URL
    if (!postsUrl) return MOCK_POSTS
    
    const postsRes = await fetch(postsUrl)
    if (!postsRes.ok) return MOCK_POSTS
    const postsData = await postsRes.json()
    
    const featuredImages = process.env.CLOUDWAYS_FEATURED_IMAGES_URL
    if (!featuredImages) return MOCK_POSTS

    let i = 0
    while (i < postsData.length) {
      const imageUrl = `${featuredImages}/${postsData[i].featured_media}`
      const imageRes = await fetch(imageUrl)
      if (imageRes.ok) {
        const imageData = await imageRes.json()
        if (imageData && imageData.media_details) {
          //we push a post object into the array
          const post: {
            id: string
            title: string
            image: string
            content: string
            createdAt: Date
          } = {
            id: postsData[i].id,
            title: postsData[i].title.rendered,
            image: imageData.media_details.file,
            content: postsData[i].content.rendered,
            createdAt: new Date(postsData[i].date),
          }
          postArray.push(post)
        }
      }
      i++
    }

    if (postsData && postArray.length > 0) {
      return postArray
    }
    return MOCK_POSTS
  } catch (error) {
    console.warn('WordPress blog source offline, using fallback mock posts.', error instanceof Error ? error.message : error)
    return MOCK_POSTS
  }
}

export const onGetBlogPost = async (id: string) => {
  try {
    const postUrl = process.env.CLOUDWAYS_POSTS_URL
    if (!postUrl) {
      return MOCK_POSTS.find((p) => p.id === id)
    }
    
    const postRes = await fetch(`${postUrl}/${id}`)
    if (!postRes.ok) {
      return MOCK_POSTS.find((p) => p.id === id)
    }
    const postData = await postRes.json()
    
    if (postData) {
      const authorUrl = process.env.CLOUDWAYS_USERS_URL
      if (!authorUrl) return
      
      const authorRes = await fetch(`${authorUrl}${postData.author}`)
      if (authorRes.ok) {
        const authorData = await authorRes.json()
        if (authorData) {
          return {
            id: postData.id,
            title: postData.title.rendered,
            content: postData.content.rendered,
            createdAt: new Date(postData.date),
            author: authorData.name,
          }
        }
      }
    }
  } catch (error) {
    console.warn('WordPress blog source offline, trying mock posts for ID:', id)
    return MOCK_POSTS.find((p) => p.id === id)
  }
}
