@component('mail::message')
# {{ $type === 'email_verification' ? 'Verify Your Email Address' : 'Reset Your Password' }}

Hello,

{{ $type === 'email_verification'
    ? 'Thank you for registering with Cloud Clean Store. Please use the OTP below to verify your email address.'
    : 'We received a request to reset your password. Use the OTP below to proceed.' }}

@component('mail::panel')
# Your OTP Code

<div style="text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #7c3aed;">
{{ $otp }}
</div>
@endcomponent

This OTP is valid for **{{ $expiryMinutes }} minutes**.

⚠️ Do NOT share this OTP with anyone. Cloud Clean Store will never ask for your OTP.

If you did not request this, please ignore this email.

Thanks,<br>
**Cloud Clean Store Team**
@endcomponent