'use client'

import { Shield, Mail, Phone, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const teamMembers = [
  { name: 'P. Akshitha', role: 'Team Lead', initials: 'PA', status: 'online' },
  { name: 'V. Bhagyendra', role: 'Developer', initials: 'VB', status: 'online' },
  { name: 'P. Harsha', role: 'Developer', initials: 'PH', status: 'away' },
  { name: 'Manohar', role: 'Developer', initials: 'M', status: 'offline' },
  { name: 'Rupa Sri', role: 'Developer', initials: 'RS', status: 'online' },
]

export function UserProfileCard() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          Operator Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Profile */}
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src="/placeholder-user.jpg" alt="P. Akshitha" />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">PA</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">P. Akshitha</h3>
            <p className="text-sm text-muted-foreground">Team Lead - ECE-A</p>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
              Active Operator
            </Badge>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="size-4 text-muted-foreground" />
            <span>25R21A0435@mlrinstitutions.ac.in</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="size-4 text-muted-foreground" />
            <span>+91 8125863446</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="size-4 text-muted-foreground" />
            <span>MLR Institute of Technology, Hyderabad</span>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Team Members</h4>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-secondary text-xs">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card ${
                        member.status === 'online'
                          ? 'bg-chart-1'
                          : member.status === 'away'
                            ? 'bg-chart-3'
                            : 'bg-muted-foreground'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
