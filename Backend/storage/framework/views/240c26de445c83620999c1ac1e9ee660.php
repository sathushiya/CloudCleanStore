<?php $__env->startComponent('mail::message'); ?>
# <?php echo new \Illuminate\Support\EncodedHtmlString($type === 'email_verification' ? 'Verify Your Email Address' : 'Reset Your Password'); ?>


Hello,

<?php echo new \Illuminate\Support\EncodedHtmlString($type === 'email_verification'
    ? 'Thank you for registering with Cloud Clean Store. Please use the OTP below to verify your email address.'
    : 'We received a request to reset your password. Use the OTP below to proceed.'); ?>


<?php $__env->startComponent('mail::panel'); ?>
# Your OTP Code

<div style="text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #7c3aed;">
<?php echo new \Illuminate\Support\EncodedHtmlString($otp); ?>

</div>
<?php echo $__env->renderComponent(); ?>

This OTP is valid for **<?php echo new \Illuminate\Support\EncodedHtmlString($expiryMinutes); ?> minutes**.

⚠️ Do NOT share this OTP with anyone. Cloud Clean Store will never ask for your OTP.

If you did not request this, please ignore this email.

Thanks,<br>
**Cloud Clean Store Team**
<?php echo $__env->renderComponent(); ?><?php /**PATH D:\CloudCleanStore\CloudCleanStore\Backend\resources\views/emails/otp.blade.php ENDPATH**/ ?>