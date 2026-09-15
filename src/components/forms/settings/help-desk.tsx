'use client'
import React from 'react'
import { useHelpDesk } from '@/hooks/settings/use-settings'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import Section from '@/components/section-label'
import FormGenerator from '../form-generator'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import Accordion from '@/components/accordian'
import { PlusCircle, HelpCircle } from 'lucide-react'

type Props = {
  id: string
}

const HelpDesk = ({ id }: Props) => {
  const { register, errors, onSubmitQuestion, isQuestions, loading } =
    useHelpDesk(id)

  return (
    <Card className="w-full grid grid-cols-1 lg:grid-cols-2 rounded-xl border border-border/60 overflow-hidden shadow-sm">
      <CardContent className="p-6 border-b lg:border-b-0 lg:border-r border-border/60 bg-card">
        <div className="flex items-center gap-2 mb-6">
          <PlusCircle size={18} className="text-primary" />
          <CardTitle className="text-base font-semibold">Add FAQ Item</CardTitle>
        </div>
        <form
          onSubmit={onSubmitQuestion}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <Section
              label="Question"
              message="Add a question that customers frequently ask."
            />
            <FormGenerator
              inputType="input"
              register={register}
              errors={errors}
              form="help-desk-form"
              name="question"
              placeholder="e.g. What are your business hours?"
              type="text"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Section
              label="Answer"
              message="The response the chatbot should provide."
            />
            <FormGenerator
              inputType="textarea"
              register={register}
              errors={errors}
              name="answer"
              form="help-desk-form"
              placeholder="e.g. We are open Monday to Friday from 9am to 6pm EST."
              type="text"
              lines={4}
            />
          </div>
          <Button type="submit" className="w-full font-semibold h-10 rounded-lg shadow-sm">
            Create FAQ
          </Button>
        </form>
      </CardContent>
      <CardContent className="p-6 overflow-y-auto max-h-[480px] bg-muted/20 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Knowledge Base ({isQuestions.length})
            </span>
          </div>
        </div>
        <Loader loading={loading}>
          {isQuestions.length ? (
            <div className="flex flex-col gap-2 pt-1">
              {isQuestions.map((question) => (
                <Accordion
                  key={question.id}
                  trigger={question.question}
                  content={question.answer}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
              <HelpCircle className="w-8 h-8 opacity-40" />
              <CardDescription>No FAQ questions created yet.</CardDescription>
            </div>
          )}
        </Loader>
      </CardContent>
    </Card>
  )
}

export default HelpDesk
