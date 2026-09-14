import {
  onBookNewAppointment,
  saveAnswers,
} from '@/actions/appointment'
import { useToast } from '@/components/ui/use-toast'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

export const usePortal = (
  customerId: string,
  domainId: string,
  email: string
) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm()
  const { toast } = useToast()
  const [step, setStep] = useState<number>(1)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    setValue('date', date)
  }, [date, setValue])

  const onNext = () => setStep((prev) => prev + 1)

  const onPrev = () => setStep((prev) => prev - 1)

  const onBookAppointment = handleSubmit(async (values) => {
    if (loading) return

    try {
      setLoading(true)
      const questions = Object.keys(values)
        .filter((key) => key.startsWith('question'))
        .reduce((obj: any, key) => {
          obj[key.split('question-')[1]] = values[key]
          return obj
        }, {})

      const savedAnswers = await saveAnswers(questions, customerId)

      if (savedAnswers) {
        const booked = await onBookNewAppointment(
          domainId,
          customerId,
          values.slot,
          values.date,
          email
        )
        if (booked && booked.status == 200) {
          toast({
            title: 'Success',
            description: booked.message,
          })
          setStep(3)
        } else {
          toast({
            title: 'Error',
            description: booked?.message ?? 'Booking failed — please try again.',
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Booking failed — please try again.',
      })
    } finally {
      setLoading(false)
    }
  })

  const onSelectedTimeSlot = (slot: string) => setSelectedSlot(slot)

  return {
    step,
    onNext,
    onPrev,
    register,
    errors,
    loading,
    onBookAppointment,
    date,
    setDate,
    onSelectedTimeSlot,
    selectedSlot,
  }
}
