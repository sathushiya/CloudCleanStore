import { FileText } from 'lucide-react';
import BackButton from '../components/common/BackButton';

export type LegalPageType = 'privacy' | 'terms' | 'cookies';

interface LegalProps {
  page: LegalPageType;
  onBack: () => void;
}

const LAST_UPDATED = 'August 24, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
      <div className="text-gray-600 dark:text-gray-400 space-y-3 leading-relaxed">{children}</div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <>
      <Section title="What we collect">
        <p>When you create an account or place an order, we collect your name, email address, phone number,
        delivery address(es), and order history. If you pay by bank transfer, we also store the payment
        reference you submit and, if provided, a proof-of-payment image.</p>
      </Section>
      <Section title="Phone number &amp; WhatsApp">
        <p>Your phone number is verified via a one-time code sent over WhatsApp using the Green API service.
        We use it to verify you own the number, and afterwards to send order-related updates (payment
        confirmation, delivery status) — never for marketing without your separate consent.</p>
      </Section>
      <Section title="How we use your information">
        <ul className="list-disc pl-5 space-y-1">
          <li>Processing and delivering your orders</li>
          <li>Verifying your identity and account (email OTP, WhatsApp verification)</li>
          <li>Sending order status updates by WhatsApp and, where enabled, email or SMS</li>
          <li>Responding to support requests</li>
          <li>Improving the products and service we offer</li>
        </ul>
      </Section>
      <Section title="Who we share it with">
        <p>We don't sell your personal data. We share the minimum necessary with the third-party services
        that make the store work:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Green API</strong> — to deliver WhatsApp verification and order-update messages</li>
          <li><strong>Cloudinary</strong> — to host product images</li>
          <li>Our delivery staff — your name, phone number, and delivery address, only for orders assigned to them</li>
        </ul>
      </Section>
      <Section title="How long we keep it">
        <p>We keep your account and order data for as long as your account is active, and for a reasonable
        period afterward for accounting and legal purposes. You can request deletion of your account by
        contacting us — see below.</p>
      </Section>
      <Section title="Your rights">
        <p>You can view and update your name from Settings at any time. To request a copy of your data, a
        correction, or account deletion, contact us using the details at the bottom of this page.</p>
      </Section>
      <Section title="Contact">
        <p>Questions about this policy? Reach us at <strong>076 542 7147</strong> or via WhatsApp on the
        same number.</p>
      </Section>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <Section title="Using this site">
        <p>By creating an account or placing an order with Cloud Clean Store, you agree to these terms. You
        must provide accurate information (in particular a real, working phone number, since it's used to
        verify orders and deliveries) and are responsible for keeping your account credentials secure.</p>
      </Section>
      <Section title="Orders &amp; pricing">
        <p>Placing an order is an offer to purchase, which we accept when your order is confirmed. Prices
        are shown in LKR and may change without notice, though a price change never affects an order already
        placed. Product availability is checked at the time you add an item to your cart and again when you
        check out — an item can occasionally sell out between the two.</p>
      </Section>
      <Section title="Payment">
        <p>We currently accept cash on delivery and bank transfer. For bank transfer, your order is confirmed
        once we've verified your payment reference — this is usually quick, but please allow some time. If we
        can't verify a payment, we'll let you know over WhatsApp and you're welcome to resubmit a corrected
        reference.</p>
      </Section>
      <Section title="Delivery">
        <p>We aim to deliver within the estimated window shown at checkout, but delivery times are estimates,
        not guarantees, and can be affected by traffic, weather, or order volume.</p>
      </Section>
      <Section title="Cancellations">
        <p>An order can be cancelled by our staff before it's out for delivery. If you'd like to cancel an
        order yourself, please contact us as soon as possible — we're not always able to stop an order once
        it's already on its way.</p>
      </Section>
      <Section title="Returns &amp; issues">
        <p>If an item arrives damaged, incorrect, or faulty, contact us within 48 hours of delivery with your
        order number and we'll sort out a replacement or refund.</p>
      </Section>
      <Section title="Reviews">
        <p>You may leave a review after an order is delivered. Reviews should reflect your genuine experience;
        we may remove reviews that are abusive, spam, or unrelated to the order.</p>
      </Section>
      <Section title="Governing law">
        <p>These terms are governed by the laws of Sri Lanka.</p>
      </Section>
      <Section title="Contact">
        <p>Questions about an order or these terms? Reach us at <strong>076 542 7147</strong>.</p>
      </Section>
    </>
  );
}

function CookiesContent() {
  return (
    <>
      <Section title="What we store in your browser">
        <p>We use your browser's local storage — not tracking cookies — to keep the site working smoothly:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Your session</strong> — an access token so you stay signed in between visits</li>
          <li><strong>Your cart</strong> — the items you've added, so they're still there if you close the tab</li>
          <li><strong>Your theme preference</strong> — light or dark mode</li>
        </ul>
      </Section>
      <Section title="What we don't do">
        <p>We don't use third-party advertising or analytics cookies, and we don't track you across other
        websites.</p>
      </Section>
      <Section title="Managing this">
        <p>You can clear your browser's local storage for this site at any time from your browser settings —
        this will sign you out and clear your cart, but won't affect your account or order history, which
        live on our servers.</p>
      </Section>
      <Section title="Contact">
        <p>Questions? Reach us at <strong>076 542 7147</strong>.</p>
      </Section>
    </>
  );
}

const PAGE_META: Record<LegalPageType, { title: string; content: () => JSX.Element }> = {
  privacy: { title: 'Privacy Policy', content: PrivacyContent },
  terms: { title: 'Terms of Service', content: TermsContent },
  cookies: { title: 'Cookie Policy', content: CookiesContent },
};

export default function Legal({ page, onBack }: LegalProps) {
  const { title, content: Content } = PAGE_META[page];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0a1e] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton onBack={onBack} />
        </div>

        <div className="mb-10 text-center">
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500">Last updated {LAST_UPDATED}</p>
        </div>

        <div className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-8 border border-gray-200 dark:border-purple-700/20">
          <Content />
        </div>
      </div>
    </div>
  );
}
