import React from "react";
import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "[EFFECTIVE DATE — e.g. January 1, 2026]";
const COMPANY_NAME = "[YOUR COMPANY LEGAL NAME]";
const CONTACT_EMAIL = "dav.vazquez1719@gmail.com";
const GOVERNING_STATE = "[YOUR STATE]";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-xs text-primary hover:underline">&larr; Back</Link>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide mt-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mt-1">Effective date: {EFFECTIVE_DATE}</p>

        <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          <strong>MVP notice:</strong> These Terms of Service are a starting-point draft prepared for an
          early-stage product launch. They are not a substitute for legal advice. Before relying on them in
          production — and especially before scaling to significant user volume or handling disputes — have them
          reviewed by a licensed attorney familiar with U.S. commercial and consumer-protection law.
        </div>

        <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <p>
            These Terms of Service ("Terms") are a legal agreement between you and {COMPANY_NAME} ("we," "us,"
            "our") governing your access to and use of MechField, our software-as-a-service application for
            managing clients, vehicles, inventory, work orders, and invoices for mobile and independent mechanics
            (the "Service"). By creating an account or otherwise using the Service, you agree to these Terms. If
            you do not agree, do not use the Service.
          </p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">1. Description of the Service</h2>
          <p>
            The Service is a business-management tool that lets you record and organize your own clients, their
            vehicles, your parts inventory, the work orders you create, and the invoices you generate, and export
            that information as shareable PDF documents. The Service is a record-keeping and organization tool
            only — it does not perform automotive diagnostics, does not guarantee the accuracy of any data you
            enter, and does not replace your own professional judgment as a mechanic.
          </p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">2. Accounts</h2>
          <p>You must provide accurate information when registering and keep your login credentials confidential. You are responsible for all activity that occurs under your account. Notify us immediately at {CONTACT_EMAIL} if you suspect unauthorized access to your account.</p>
          <p>The Service is intended for use by individuals operating or employed by an automotive repair business, acting in that business capacity. You must be at least 18 years old to create an account.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">3. Your Responsibilities</h2>
          <p>As the Account Holder, you are solely responsible for:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>The accuracy of the client, vehicle, inventory, work order, and invoice information you enter.</li>
            <li>Having the appropriate legal basis and, where required, consent to enter your customers' personal information into the Service.</li>
            <li>All business, pricing, diagnostic, and repair decisions you make — the Service is a record-keeping tool and does not provide automotive, business, financial, or legal advice.</li>
            <li>Complying with all laws applicable to your business, including consumer protection, automotive repair disclosure, and data privacy laws in the jurisdictions where you operate.</li>
            <li>Maintaining your own copies of critical records as you see fit — see Section 6 on availability.</li>
          </ul>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">4. Subscriptions, Billing, and Cancellation</h2>
          <p>
            Subscription fees, billing, and payment processing for the Service are handled entirely by <strong>Lemon
            Squeezy, Inc.</strong>, acting as our Merchant of Record. Lemon Squeezy is the seller of record for your
            subscription, collects your payment method, and calculates, collects, and remits applicable U.S. sales
            tax. Your purchase is also subject to <a href="https://www.lemonsqueezy.com/terms" target="_blank" rel="noreferrer" className="text-primary hover:underline">Lemon Squeezy's own Terms of Service</a>.
          </p>
          <p>
            Subscriptions renew automatically for successive billing periods (monthly or annually, as selected at
            purchase) until cancelled. You may cancel at any time; your access continues through the end of the
            billing period already paid for, and no further charges will be made. Except where required by law or
            expressly stated otherwise at the time of purchase, fees already paid are non-refundable, including for
            partial billing periods. We reserve the right to change subscription pricing on a going-forward basis,
            with reasonable advance notice before it applies to your next renewal.
          </p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">5. Acceptable Use</h2>
          <p>You agree not to: use the Service for any unlawful purpose; attempt to gain unauthorized access to another Account Holder's data or to our systems; interfere with or disrupt the integrity or performance of the Service; upload malicious code; or use the Service to store or transmit content that infringes another party's rights.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">6. Availability and Disclaimer of Warranties</h2>
          <p>
            We aim to keep the Service available and reliable but do not guarantee 100% uptime, and the Service may
            be temporarily unavailable for maintenance, updates, or reasons outside our control. <strong>THE SERVICE
            IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR
            STATUTORY, INCLUDING WITHOUT LIMITATION IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, AND NON-INFRINGEMENT.</strong> We do not warrant that the Service will be uninterrupted,
            error-free, or that any data loss will never occur, and we recommend exporting/backing up records you
            consider critical using the Service's own PDF export features.
          </p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">7. Limitation of Liability</h2>
          <p>
            <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, {COMPANY_NAME.toUpperCase()} SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE,
            DATA, OR BUSINESS OPPORTUNITY, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF ADVISED OF
            THE POSSIBILITY OF SUCH DAMAGES.</strong> We are not responsible for your business, diagnostic, pricing,
            or repair decisions, or for disputes between you and your own customers. <strong>OUR TOTAL AGGREGATE
            LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID
            US FOR THE SERVICE IN THE THREE (3) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.</strong> Some
            jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above
            limitations may not apply to you.
          </p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">8. Your Data</h2>
          <p>You retain ownership of the data you enter into the Service. You grant us a limited license to host, store, process, and display that data solely as necessary to provide the Service to you. See our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for how we collect, use, and protect information.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">9. Termination</h2>
          <p>You may stop using the Service and cancel your subscription at any time. We may suspend or terminate your access if you violate these Terms, engage in conduct that risks harm to the Service or other users, or if required to do so by law. Upon termination, your right to use the Service ends immediately; we will handle your data as described in our Privacy Policy.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">10. Changes to the Service or These Terms</h2>
          <p>We may modify or discontinue features of the Service, and may update these Terms from time to time. If we make material changes to these Terms, we will provide reasonable advance notice (for example, by email or an in-app notice) before they take effect. Continued use of the Service after a change becomes effective constitutes acceptance of the revised Terms.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">11. Governing Law</h2>
          <p>These Terms are governed by the laws of the State of {GOVERNING_STATE}, United States, without regard to its conflict-of-laws principles. Any dispute arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the state and federal courts located in {GOVERNING_STATE}, and you consent to personal jurisdiction there.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">12. Contact Us</h2>
          <p>Questions about these Terms can be sent to <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.</p>
        </div>
      </div>
    </div>
  );
}
