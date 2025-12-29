import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { User, Save, Key, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/user'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getAvatarUrl } from '@/lib/config'
import { useOptimistic } from 'react'
import { preloadImage } from '@/utils/imagePreloader'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function ProfilePage() {
  const { user, refreshUser, invalidateAvatarCache, avatarCacheKey } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Optimistic avatar state for instant UI feedback
  const [optimisticAvatar, setOptimisticAvatar] = useOptimistic(
    user?.avatar_url ?? null
  )
  
  // Initialize form state from user data
  // Form maintains independent state that diverges as user edits
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    organization: user?.organization || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof profileData) => userService.updateProfile(data),
    onSuccess: async (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser)
      await refreshUser()
      toast.success('Profile updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData)
  }

  const changePasswordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      userService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password')
    },
  })

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }
    changePasswordMutation.mutate({
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
    })
  }

  const deleteAccountMutation = useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      toast.success('Account deleted successfully')
      navigate('/login')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete account')
    },
  })

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate()
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: async (updatedUser) => {
      // Preload new avatar before updating state for smooth transition
      if (updatedUser.avatar_url) {
        const newAvatarUrl = getAvatarUrl(updatedUser.avatar_url, new Date())
        if (newAvatarUrl) {
          try {
            await preloadImage(newAvatarUrl)
          } catch (error) {
            console.warn('Failed to preload avatar:', error)
          }
        }
      }
      
      // Update all caches
      queryClient.setQueryData(['user'], updatedUser)
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      await refreshUser()
      invalidateAvatarCache()
      
      toast.success('Avatar updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload avatar')
    },
  })

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or GIF image')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    // Show optimistic preview immediately using blob URL
    const previewUrl = URL.createObjectURL(file)
    setOptimisticAvatar(previewUrl)
    
    try {
      await uploadAvatarMutation.mutateAsync(file)
      // Success - optimistic state auto-reverts to real server state
    } catch (error) {
      // Error - optimistic state auto-reverts to previous state
      console.error('Avatar upload failed:', error)
    } finally {
      // Clean up blob URL to prevent memory leaks
      URL.revokeObjectURL(previewUrl)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and account settings
        </p>
      </div>

      <Separator />

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={getAvatarUrl(optimisticAvatar, avatarCacheKey) || undefined} 
                  alt={profileData.name}
                  key={avatarCacheKey}
                />
                <AvatarFallback>
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={handleAvatarClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or GIF. Max 5MB
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={profileData.organization}
                onChange={(e) =>
                  setProfileData({ ...profileData, organization: e.target.value })
                }
                placeholder="Your school or organization"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
                placeholder="Tell us a bit about yourself"
                rows={4}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveProfile} 
                className="gap-2"
                disabled={updateProfileMutation.isPending}
              >
                <Save className="h-4 w-4" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleChangePassword()
              }}
              className="space-y-4"
            >
              {/* Hidden username field for accessibility and password managers */}
              <input
                type="email"
                autoComplete="username"
                value={user?.email || ''}
                readOnly
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              />
              
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit"
                  className="gap-2"
                  disabled={changePasswordMutation.isPending}
                >
                  <Key className="h-4 w-4" />
                  {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Irreversible actions that affect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers, including all projects, documents,
                      and conversation history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
