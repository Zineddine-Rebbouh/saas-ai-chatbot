import {
  onAddCustomersToEmail,
  onBulkMailer,
  onCreateMarketingCampaign,
  onGetAllCustomerResponses,
  onGetEmailTemplate,
  onSaveEmailTemplate,
} from '@/actions/mail'
import { useToast } from '@/components/ui/use-toast'
import {
  EmailMarketingBodySchema,
  EmailMarketingSchema,
} from '@/schemas/marketing.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

export const useEmailMarketing = () => {
  const [isSelected, setIsSelected] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [campaignId, setCampaignId] = useState<string | undefined>()
  const [processing, setProcessing] = useState<boolean>(false)
  const [isId, setIsId] = useState<string | undefined>(undefined)
  const [editing, setEditing] = useState<boolean>(false)
  const [sendingId, setSendingId] = useState<string | undefined>(undefined)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(EmailMarketingSchema),
  })

  const {
    register: registerEmail,
    formState: { errors: emailErrors },
    handleSubmit: SubmitEmail,
    setValue,
  } = useForm({
    resolver: zodResolver(EmailMarketingBodySchema),
  })
  const { toast } = useToast()
  const router = useRouter()

  const onCreateCampaign = handleSubmit(async (values) => {
    try {
      setLoading(true)
      const campaign = await onCreateMarketingCampaign(values.name)
      if (campaign) {
        reset()
        toast({
          title: 'Success',
          description: campaign.message,
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: 'Campaign could not be created — please try again.',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Campaign could not be created — please try again.',
      })
    } finally {
      setLoading(false)
    }
  })

  const onCreateEmailTemplate = SubmitEmail(async (values) => {
    try {
      if (!campaignId) {
        toast({
          title: 'Error',
          description: 'Select a campaign before saving the email.',
        })
        return
      }
      setEditing(true)
      const template = JSON.stringify(values.description)
      const emailTemplate = await onSaveEmailTemplate(template, campaignId)
      if (emailTemplate) {
        toast({
          title: 'Success',
          description: emailTemplate.message,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Email template could not be saved — please try again.',
      })
    } finally {
      setEditing(false)
    }
  })

  const onSelectCampaign = (id: string) => setCampaignId(id)

  const onAddCustomersToCampaign = async () => {
    if (!campaignId) {
      toast({
        title: 'Error',
        description: 'Select a campaign before adding customers.',
      })
      return
    }
    if (processing) return

    try {
      setProcessing(true)
      const customersAdd = await onAddCustomersToEmail(isSelected, campaignId)
      if (customersAdd) {
        toast({
          title: 'Success',
          description: customersAdd.message,
        })
        setCampaignId(undefined)
        router.refresh()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Customers could not be added to the campaign — please try again.',
      })
    } finally {
      setProcessing(false)
    }
  }

  const onSelectedEmails = (email: string) => {
    //add or remove
    const duplicate = isSelected.find((e) => e == email)
    if (duplicate) {
      setIsSelected(isSelected.filter((e) => e !== email))
    } else {
      setIsSelected((prev) => [...prev, email])
    }
  }

  const onBulkEmail = async (emails: string[], campaignId: string) => {
    if (sendingId) return

    try {
      setSendingId(campaignId)
      const mails = await onBulkMailer(emails, campaignId)
      if (mails) {
        toast({
          title: 'Success',
          description: mails.message,
        })
        router.refresh()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Emails could not be sent — please try again.',
      })
    } finally {
      setSendingId(undefined)
    }
  }

  const onSetAnswersId = (id: string) => setIsId(id)

  return {
    onSelectedEmails,
    isSelected,
    onCreateCampaign,
    register,
    errors,
    loading,
    onSelectCampaign,
    processing,
    campaignId,
    onAddCustomersToCampaign,
    onBulkEmail,
    sendingId,
    onSetAnswersId,
    isId,
    registerEmail,
    emailErrors,
    onCreateEmailTemplate,
    editing,
    setValue,
  }
}

export const useAnswers = (id: string) => {
  const [answers, setAnswers] = useState<
    {
      customer: {
        questions: { question: string; answered: string | null }[]
      }[]
    }[]
  >([])
  const [loading, setLoading] = useState<boolean>(false)
  const { toast } = useToast()

  const onGetCustomerAnswers = async () => {
    try {
      setLoading(true)
      const answer = await onGetAllCustomerResponses(id)
      if (answer) {
        setAnswers(answer)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not load customer answers — please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    onGetCustomerAnswers()
  }, [id])

  return { answers, loading }
}

export const useEditEmail = (id: string) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [template, setTemplate] = useState<string>('')
  const { toast } = useToast()

  const onGetTemplate = async (id: string) => {
    try {
      setLoading(true)
      const email = await onGetEmailTemplate(id)
      if (email) {
        setTemplate(email)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not load email template — please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    onGetTemplate(id)
  }, [id])

  return { loading, template }
}
