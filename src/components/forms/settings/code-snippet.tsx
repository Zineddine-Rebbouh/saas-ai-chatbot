'use client'
import Section from '@/components/section-label'
import { useToast } from '@/components/ui/use-toast'
import { Check, Copy } from 'lucide-react'
import React, { useState } from 'react'

type Props = {
  id: string
}

const CodeSnippet = ({ id }: Props) => {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const snippet = `const iframe = document.createElement("iframe");

const iframeStyles = (styleString) => {
  const style = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
}

iframeStyles(\`
  .chat-frame {
    position: fixed;
    bottom: 50px;
    right: 50px;
    border: none;
    background: transparent;
    z-index: 9999;
  }
\`)

iframe.src = "http://localhost:3000/chatbot"
iframe.classList.add('chat-frame')
iframe.setAttribute('frameborder', '0')
iframe.setAttribute('allowtransparency', 'true')
iframe.setAttribute('scrolling', 'no')
iframe.style.background = 'transparent'
iframe.width = 80
iframe.height = 80
document.body.appendChild(iframe)

window.addEventListener("message", (e) => {
  if(e.origin !== "http://localhost:3000") return null
  try {
    let dimensions = JSON.parse(e.data)
    iframe.width = dimensions.width
    iframe.height = dimensions.height
    iframe.contentWindow.postMessage("${id}", "http://localhost:3000/")
  } catch { return null }
})`

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    toast({
      title: 'Copied to clipboard',
      description: 'You can now paste the code inside your website',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3">
      <Section
        label="Code snippet"
        message="Copy and paste this into the <head> tag of your website"
      />
      <div className="relative rounded-xl bg-zinc-950 dark:bg-zinc-900 border border-border/40 overflow-hidden group">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors px-2.5 py-1 rounded-md hover:bg-white/10 font-medium"
          >
            {copied ? (
              <>
                <Check size={13} className="text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                Copy code
              </>
            )}
          </button>
        </div>
        {/* Code body */}
        <pre className="p-5 text-xs leading-6 text-zinc-300 font-mono overflow-x-auto max-h-64 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <code>{snippet}</code>
        </pre>
      </div>
    </div>
  )
}

export default CodeSnippet
