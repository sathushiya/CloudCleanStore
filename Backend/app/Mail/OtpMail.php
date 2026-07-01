<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public  $otp;
    public  $type;
    public  $expiryMinutes;
    public  $subject;

    public function __construct(string $otp, string $type)
    {
        $this->otp = $otp;
        $this->type = $type;
        $this->expiryMinutes = (string) env('OTP_EXPIRY_MINUTES', 10);
        $this->subject = $type === 'email_verification'
            ? 'Verify Your Email — Cloud Clean Store'
            : 'Password Reset OTP — Cloud Clean Store';
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.otp',
        );
    }
}