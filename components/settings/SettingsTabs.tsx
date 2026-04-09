'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import { Profile } from '@/types'
import {
  businessSettingsSchema,
  changePasswordSchema,
  defaultsSettingsSchema,
  profileSettingsSchema,
  type BusinessSettingsValues,
  type ChangePasswordValues,
  type DefaultsSettingsValues,
  type ProfileSettingsValues,
} from '@/lib/validations/settings'
import {
  changePasswordAction,
  updateBusinessSettingsAction,
  updateDefaultsSettingsAction,
  updateProfileSettingsAction,
  uploadAvatarAction,
  uploadCompanyLogoAction,
} from '@/lib/actions/settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SettingsTabsProps {
  profile: Profile
}

async function uploadFile(action: (formData: FormData) => Promise<{ data: { url: string } | null; error: string | null }>, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return action(formData)
}

export function SettingsTabs({ profile }: SettingsTabsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState<string | null>(null)

  const profileForm = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      full_name: profile.full_name ?? '',
      avatar_url: profile.avatar_url ?? null,
    },
  })

  const businessForm = useForm<BusinessSettingsValues>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      company_name: profile.company_name ?? null,
      company_logo: profile.company_logo ?? null,
      address: profile.address ?? null,
    },
  })

  const defaultsForm = useForm<DefaultsSettingsValues>({
    resolver: zodResolver(defaultsSettingsSchema),
    defaultValues: {
      tax_rate: Number(profile.tax_rate ?? 0),
      payment_terms: profile.payment_terms ?? 'Net 30',
      invoice_notes: profile.invoice_notes ?? null,
    },
  })

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  async function onAvatarSelected(file: File) {
    setSaving('profile')
    const upload = await uploadFile(uploadAvatarAction, file)
    if (upload.error || !upload.data) {
      toast({ title: 'Upload failed', description: upload.error ?? 'Could not upload file', variant: 'destructive' })
      setSaving(null)
      return
    }

    profileForm.setValue('avatar_url', upload.data.url)
    setSaving(null)
  }

  async function onLogoSelected(file: File) {
    setSaving('business')
    const upload = await uploadFile(uploadCompanyLogoAction, file)
    if (upload.error || !upload.data) {
      toast({ title: 'Upload failed', description: upload.error ?? 'Could not upload file', variant: 'destructive' })
      setSaving(null)
      return
    }

    businessForm.setValue('company_logo', upload.data.url)
    setSaving(null)
  }

  async function saveProfile(values: ProfileSettingsValues) {
    setSaving('profile')
    const result = await updateProfileSettingsAction(values)
    setSaving(null)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: 'Profile updated' })
    router.refresh()
  }

  async function saveBusiness(values: BusinessSettingsValues) {
    setSaving('business')
    const result = await updateBusinessSettingsAction(values)
    setSaving(null)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: 'Business settings updated' })
    router.refresh()
  }

  async function saveDefaults(values: DefaultsSettingsValues) {
    setSaving('defaults')
    const result = await updateDefaultsSettingsAction(values)
    setSaving(null)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: 'Defaults updated' })
    router.refresh()
  }

  async function changePassword(values: ChangePasswordValues) {
    setSaving('security')
    const result = await changePasswordAction(values)
    setSaving(null)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: 'Password updated' })
    passwordForm.reset()
  }

  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList className="grid h-auto grid-cols-2 gap-2 md:grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="business">Business</TabsTrigger>
        <TabsTrigger value="defaults">Defaults</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" {...profileForm.register('full_name')} />
                {profileForm.formState.errors.full_name && (
                  <p className="text-xs text-red-600">{profileForm.formState.errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar-upload">Avatar</Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void onAvatarSelected(file)
                  }}
                />
                {profileForm.watch('avatar_url') && (
                  <p className="text-xs text-muted-foreground truncate">Uploaded: {profileForm.watch('avatar_url') ?? ''}</p>
                )}
              </div>

              <Button type="submit" disabled={saving === 'profile'}>
                {saving === 'profile' ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="business">
        <Card>
          <CardHeader>
            <CardTitle>Business</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={businessForm.handleSubmit(saveBusiness)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input id="company_name" {...businessForm.register('company_name')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_logo">Company Logo</Label>
                <Input
                  id="company_logo"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void onLogoSelected(file)
                  }}
                />
                {businessForm.watch('company_logo') && (
                  <p className="text-xs text-muted-foreground truncate">Uploaded: {businessForm.watch('company_logo') ?? ''}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" rows={3} {...businessForm.register('address')} />
              </div>

              <Button type="submit" disabled={saving === 'business'}>
                {saving === 'business' ? 'Saving...' : 'Save Business'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="defaults">
        <Card>
          <CardHeader>
            <CardTitle>Defaults</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={defaultsForm.handleSubmit(saveDefaults)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tax_rate">Default Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  {...defaultsForm.register('tax_rate', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input id="payment_terms" {...defaultsForm.register('payment_terms')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice_notes">Invoice Notes Template</Label>
                <Textarea id="invoice_notes" rows={4} {...defaultsForm.register('invoice_notes')} />
              </div>

              <Button type="submit" disabled={saving === 'defaults'}>
                {saving === 'defaults' ? 'Saving...' : 'Save Defaults'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(changePassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input id="current_password" type="password" {...passwordForm.register('current_password')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input id="new_password" type="password" {...passwordForm.register('new_password')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input id="confirm_password" type="password" {...passwordForm.register('confirm_password')} />
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-xs text-red-600">{passwordForm.formState.errors.confirm_password.message}</p>
                )}
              </div>

              <Button type="submit" disabled={saving === 'security'}>
                {saving === 'security' ? 'Updating...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
