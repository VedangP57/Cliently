import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  description?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
}

export function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 lg:p-6 lg:pb-2">
        <CardTitle className="text-xs lg:text-sm font-medium">{title}</CardTitle>
        <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
        <div className="text-lg lg:text-2xl font-bold">{value}</div>
        {trend && (
          <p className={cn(
            'text-xs',
            trend.positive ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.positive ? '+' : ''}{trend.value} from last month
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
