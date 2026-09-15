import CalIcon from '@/icons/cal-icon'
import ChatIcon from '@/icons/chat-icon'
import DashboardIcon from '@/icons/dashboard-icon'
import EmailIcon from '@/icons/email-icon'
import HelpDeskIcon from '@/icons/help-desk-icon'
import IntegrationsIcon from '@/icons/integrations-icon'
import SettingsIcon from '@/icons/settings-icon'
import StarIcon from '@/icons/star-icon'
import TimerIcon from '@/icons/timer-icon'

export type SIDE_BAR_MENU_PROPS = {
  label: string
  icon: JSX.Element
  path: string
}

export type MENU_GROUP_PROPS = {
  group: string
  items: SIDE_BAR_MENU_PROPS[]
}

export const GROUPED_SIDE_BAR_MENU: MENU_GROUP_PROPS[] = [
  {
    group: 'WORKSPACE',
    items: [
      {
        label: 'Dashboard',
        icon: <DashboardIcon />,
        path: 'dashboard',
      },
      {
        label: 'Conversations',
        icon: <ChatIcon />,
        path: 'conversation',
      },
      {
        label: 'Appointments',
        icon: <CalIcon />,
        path: 'appointment',
      },
    ],
  },
  {
    group: 'GROWTH',
    items: [
      {
        label: 'Email Marketing',
        icon: <EmailIcon />,
        path: 'email-marketing',
      },
    ],
  },
  {
    group: 'TOOLS & AI',
    items: [
      {
        label: 'Integrations',
        icon: <IntegrationsIcon />,
        path: 'integration',
      },
    ],
  },
  {
    group: 'ACCOUNT',
    items: [
      {
        label: 'Settings',
        icon: <SettingsIcon />,
        path: 'settings',
      },
    ],
  },
]

export const SIDE_BAR_MENU: SIDE_BAR_MENU_PROPS[] = GROUPED_SIDE_BAR_MENU.flatMap(
  (g) => g.items
)


type TABS_MENU_PROPS = {
  label: string
  icon?: JSX.Element
}

export const TABS_MENU: TABS_MENU_PROPS[] = [
  {
    label: 'unread',
    icon: <EmailIcon />,
  },
  {
    label: 'all',
    icon: <EmailIcon />,
  },
  {
    label: 'expired',
    icon: <TimerIcon />,
  },
  {
    label: 'starred',
    icon: <StarIcon />,
  },
]

export const HELP_DESK_TABS_MENU: TABS_MENU_PROPS[] = [
  {
    label: 'help desk',
  },
  {
    label: 'questions',
  },
]

export const APPOINTMENT_TABLE_HEADER = [
  'Name',
  'RequestedTime',
  'Added Time',
  'Domain',
]

export const EMAIL_MARKETING_HEADER = ['Id', 'Email', 'Answers', 'Domain']

export const BOT_TABS_MENU: TABS_MENU_PROPS[] = [
  {
    label: 'chat',
    icon: <ChatIcon />,
  },
  {
    label: 'helpdesk',
    icon: <HelpDeskIcon />,
  },
]
