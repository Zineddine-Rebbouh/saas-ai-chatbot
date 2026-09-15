'use client'
import Section from '@/components/section-label'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { useFilterQuestions } from '@/hooks/settings/use-settings'
import React from 'react'
import FormGenerator from '../form-generator'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { MessageSquarePlus, ListFilter } from 'lucide-react'

type Props = {
  id: string
}

const FilterQuestions = ({ id }: Props) => {
  const { register, errors, onAddFilterQuestions, isQuestions, loading } =
    useFilterQuestions(id)

  return (
    <Card className="w-full grid grid-cols-1 lg:grid-cols-2 rounded-xl border border-border/60 overflow-hidden shadow-sm">
      <CardContent className="p-6 border-b lg:border-b-0 lg:border-r border-border/60 bg-card">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquarePlus size={18} className="text-primary" />
          <CardTitle className="text-base font-semibold">Lead Capture Question</CardTitle>
        </div>
        <form
          onSubmit={onAddFilterQuestions}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <Section
              label="Question"
              message="Add a question your chatbot will ask leads to qualify them."
            />
            <FormGenerator
              inputType="input"
              register={register}
              errors={errors}
              form="filter-questions-form"
              name="question"
              placeholder="e.g. What is your email address?"
              type="text"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Section
              label="Expected Answer / Key"
              message="The key name or answer model for this captured question."
            />
            <FormGenerator
              inputType="textarea"
              register={register}
              errors={errors}
              form="filter-questions-form"
              name="answer"
              placeholder="e.g. User email input"
              type="text"
              lines={4}
            />
          </div>
          <Button type="submit" className="w-full font-semibold h-10 rounded-lg shadow-sm">
            Add Question
          </Button>
        </form>
      </CardContent>
      <CardContent className="p-6 overflow-y-auto max-h-[480px] bg-muted/20 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <ListFilter size={16} className="text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Configured Questions ({isQuestions.length})
            </span>
          </div>
        </div>
        <Loader loading={loading}>
          {isQuestions.length ? (
            <div className="flex flex-col gap-2 pt-1">
              {isQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-3.5 rounded-lg border border-border/60 bg-card flex flex-col gap-1 shadow-2xs hover:border-primary/40 transition-colors"
                >
                  <p className="font-semibold text-sm text-foreground">{question.question}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
              <ListFilter className="w-8 h-8 opacity-40" />
              <CardDescription>No questions added yet.</CardDescription>
            </div>
          )}
        </Loader>
      </CardContent>
    </Card>
  )
}

export default FilterQuestions
