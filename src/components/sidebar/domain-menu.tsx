import { useDomain } from '@/hooks/sidebar/use-domain'
import { cn } from '@/lib/utils'
import React from 'react'
import AppDrawer from '../drawer'
import { Plus } from 'lucide-react'
import { Loader } from '../loader'
import FormGenerator from '../forms/form-generator'
import UploadButton from '../upload-button'
import { Button } from '../ui/button'
import Link from 'next/link'
import Image from 'next/image'

type Props = {
  min?: boolean
  domains:
    | {
        id: string
        name: string
        icon: string | null
      }[]
    | null
    | undefined
}

const DomainMenu = ({ domains, min }: Props) => {
  const { register, onAddDomain, loading, errors, isDomain } = useDomain()

  return (
    <div className={cn('flex flex-col gap-3', min ? 'mt-6' : 'mt-3')}>
      <div className={cn('flex w-full items-center', min ? 'justify-center' : 'justify-between')}>
        {!min && <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-semibold">Domains</p>}
        <AppDrawer
          description="add in your domain address to integrate your chatbot"
          title="Add your business domain"
          onOpen={
            <div className="flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors rounded-full border border-border w-6 h-6">
              <Plus size={14} />
            </div>
          }
        >
          <Loader loading={loading}>
            <form
              className="mt-3 w-full flex flex-col gap-3"
              onSubmit={onAddDomain}
            >
              <FormGenerator
                inputType="input"
                register={register}
                label="Domain"
                name="domain"
                errors={errors}
                placeholder="mydomain.com"
                type="text"
              />
              <UploadButton
                register={register}
                label="Upload Icon"
                errors={errors}
              />
              <Button
                type="submit"
                className="w-full"
              >
                Add Domain
              </Button>
            </form>
          </Loader>
        </AppDrawer>
      </div>
      <div className="flex flex-col gap-1 text-muted-foreground font-medium">
        {domains &&
          domains.map((domain) => (
            <Link
              href={`/settings/${domain.name.split('.')[0]}`}
              key={domain.id}
              className={cn(
                'flex gap-3 hover:bg-secondary rounded-xl transition duration-100 ease-in-out cursor-pointer items-center',
                !min ? 'p-2' : 'p-2 flex-col gap-1 justify-center text-center',
                domain.name.split('.')[0] == isDomain && 'bg-secondary border border-primary/30'
              )}
            >
              {domain.icon ? (
                <Image
                  src={`https://ucarecdn.com/${domain.icon}/`}
                  alt={`${domain.name} icon`}
                  width={20}
                  height={20}
                  className="rounded"
                />
              ) : (
                <span className="w-5 h-5 rounded bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-foreground flex-shrink-0">
                  {domain.name.charAt(0).toUpperCase()}
                </span>
              )}
              {!min ? (
                <p className="text-sm">{domain.name}</p>
              ) : (
                <span className="text-[10px] font-medium leading-tight text-center max-w-[56px] truncate">
                  {domain.name.split('.')[0]}
                </span>
              )}
            </Link>
          ))}
      </div>
    </div>
  )
}

export default DomainMenu
