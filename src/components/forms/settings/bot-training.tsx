import TabsMenu from '@/components/tabs/intex'
import { TabsContent } from '@/components/ui/tabs'
import { HELP_DESK_TABS_MENU } from '@/constants/menu'
import React from 'react'
import HelpDesk from './help-desk'
import FilterQuestions from './filter-questions'

type Props = {
  id: string
}

const BotTrainingForm = ({ id }: Props) => {
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-border/60 bg-gradient-to-r from-emerald-500/5 via-primary/[0.03] to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_2px] shadow-emerald-500/50 shrink-0" />
          <div>
            <h2 className="font-semibold text-base tracking-tight">Bot Training</h2>
            <p className="text-xs text-muted-foreground">
              Configure FAQ answers and custom lead capture questions for your AI assistant.
            </p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <TabsMenu triggers={HELP_DESK_TABS_MENU}>
          <TabsContent value="help desk" className="w-full mt-4">
            <HelpDesk id={id} />
          </TabsContent>
          <TabsContent value="questions" className="w-full mt-4">
            <FilterQuestions id={id} />
          </TabsContent>
        </TabsMenu>
      </div>
    </div>
  )
}

export default BotTrainingForm
