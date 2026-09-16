import React from "react";
import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "[EFFECTIVE DATE — e.g. January 1, 2026]";
const COMPANY_NAME = "[YOUR COMPANY LEGAL NAME]";
const CONTACT_EMAIL = "dav.vazquez1719@gmail.com";
const GOVERNING_STATE = "[YOUR STATE]";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-xs text-primary hover:underline">&larr; Back</Link>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide mt-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-1">Effective date: {EFFECTIVE_DATE}</p>

        <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          <strong>MVP notice:</strong> This Privacy Policy is a starting-point draft prepared for an early-stage
          product launch. It is not a substitute for legal advice. Before relying on it in production — and
          especially before scaling to significant user volume, handling data subject requests, or expanding
          into new states or countries — have it reviewed by a licensed attorney familiar with U.S. privacy law
          (and any other jurisdiction where you or your users are located).
        </div>

        <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <p>
            {COMPANY_NAME} ("we," "us," or "our") provides MechField, a software-as-a-service application for
            independent and mobile mechanics to manage clients, vehicles, inventory, work orders, and invoices
            (the "Service"). This Privacy Policy explains what information we collect, how we use it, how we
            protect it, and the choices available to you.
          </p>
          <p>
            This Policy applies to two groups of people: (1) mechanics and shop owners who register for and use
            the Service directly ("you," "Account Holders"), and (2) the individuals whose information an Account
            Holder enters into the Service in the course of running their business — their customers and those
            customers' vehicles ("End-Client Data"). If you are an End-Client whose information appears in an
            Account Holder's account, please contact that mechanic or shop directly regarding their handling of
            your information; we act as the Account Holder's service provider for that data, as described below.
          </p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">1. Information We Collect</h2>
          <p><strong>Account information.</strong> When you register, we collect your email address, password (stored only as a salted cryptographic hash — we never store or can recover your actual password), and optionally your name.</p>
          <p><strong>Shop and business information.</strong> Shop name, logo, business phone number and address, and default tax rate, if you choose to provide them in Settings.</p>
          <p><strong>End-Client Data you enter.</strong> As part of using the Service, you may enter: your clients' names, phone numbers, email addresses, and mailing addresses; their vehicles' make, model, year, VIN, license plate, odometer readings, and engine hours; and the work orders, service notes, parts used, and invoices associated with that work. You are responsible for having the appropriate legal basis (e.g., your own customer relationship and, where required, their consent) to provide us this information for processing on your behalf.</p>
          <p><strong>Inventory and pricing data.</strong> Parts, part numbers, stock levels, and costs you enter to track your inventory.</p>
          <p><strong>Technical and usage information.</strong> IP address, browser type, device information, and log data generated automatically as you use the Service (for example, to detect abuse, debug errors, and secure your account).</p>
          <p><strong>We do not collect payment card information.</strong> Subscription payments are processed entirely by Lemon Squeezy, Inc., acting as Merchant of Record. Lemon Squeezy collects and processes your billing details (such as card number or other payment method) directly — we never receive, transmit, or store full payment card numbers or bank account credentials on our systems. Lemon Squeezy's handling of that information is governed by <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noreferrer" className="text-primary hover:underline">Lemon Squeezy's own Privacy Policy</a>, which we encourage you to review. Lemon Squeezy is also responsible, as Merchant of Record, for calculating, collecting, and remitting applicable U.S. sales tax on subscription purchases.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">2. How We Use Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To provide, operate, and maintain the Service (e.g., storing and retrieving your clients, vehicles, work orders, and invoices, and generating the PDF documents you request).</li>
            <li>To authenticate you and keep your account secure.</li>
            <li>To communicate with you about your account, including security notices and, where applicable, password reset requests.</li>
            <li>To monitor, debug, and improve the reliability and security of the Service.</li>
            <li>To comply with legal obligations and enforce our Terms of Service.</li>
          </ul>
          <p>We do not sell your personal information or your End-Clients' personal information, and we do not use End-Client Data for our own advertising or marketing purposes.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">3. How We Protect Information</h2>
          <p>We maintain technical and organizational measures designed to protect the information in our systems, including:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Encryption of data in transit via HTTPS/TLS between your browser and our servers.</li>
            <li>Passwords stored only as salted, one-way cryptographic hashes — never in plaintext or in a reversible form.</li>
            <li>Strict multi-tenant data isolation: every request is scoped to the authenticated account, so one Account Holder's data is never accessible to another.</li>
            <li>Short-lived authentication tokens with server-side session revocation on logout, and rate limiting on authentication endpoints to resist automated attacks.</li>
            <li>Input validation and sanitization on data submitted to the Service.</li>
            <li>Regular, automated database backups with a limited retention window.</li>
            <li>Restricted infrastructure access: our servers are firewalled to only the ports necessary to operate the Service, and administrative access requires cryptographic key-based authentication.</li>
          </ul>
          <p>No method of transmission or storage is 100% secure, and we cannot guarantee absolute security. You are responsible for choosing a strong, unique password and for keeping your login credentials confidential.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">4. Data Sharing</h2>
          <p>We do not sell personal information. We may share information with:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Lemon Squeezy, Inc.</strong>, solely to process your subscription payment as our Merchant of Record, as described above.</li>
            <li><strong>Service providers</strong> who host our infrastructure or otherwise process data on our behalf, under obligations to protect it consistent with this Policy.</li>
            <li><strong>Law enforcement or other parties</strong> when required by law, subpoena, or other legal process, or when we believe in good faith it's necessary to protect our rights, your safety, or the safety of others.</li>
            <li><strong>A successor entity</strong> in connection with a merger, acquisition, or sale of assets, subject to that entity's continued adherence to a privacy policy that provides comparable protections.</li>
          </ul>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">5. Data Retention</h2>
          <p>We retain your account information and the data you've entered into the Service for as long as your account remains active. If you close your account, we will delete or anonymize your data within a commercially reasonable period, except where we are required to retain it to comply with legal obligations, resolve disputes, or enforce our agreements. Automated database backups are retained on a rolling basis (currently up to 7 days) and are then permanently deleted.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">6. Your Rights and Choices</h2>
          <p>Regardless of where you live, you may:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Access</strong> the personal information we hold about you by logging into your account, where most of it is directly viewable and exportable (e.g., via the PDF export features).</li>
            <li><strong>Correct</strong> inaccurate information directly within the Service, or by contacting us.</li>
            <li><strong>Delete</strong> your account and associated data by contacting us at {CONTACT_EMAIL}. We will verify your identity before processing a deletion request.</li>
            <li><strong>Object to or restrict</strong> certain processing, or request a copy of your data in a portable format, by contacting us — we will accommodate such requests to the extent required by applicable law.</li>
          </ul>
          <p>If you are a California resident, you may have additional rights under the California Consumer Privacy Act (CCPA); if you are a resident of another state with its own comprehensive privacy law, similar rights may apply. Contact us and we will address your request under the law applicable to you. We do not discriminate against users for exercising these rights.</p>
          <p>If you are an End-Client whose information was entered by an Account Holder (a mechanic or shop), the most direct way to exercise these rights is to contact that business, since they control what information is entered. We will also honor a direct, verifiable request from an End-Client to the extent we are able to do so consistent with our obligations to the Account Holder.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">7. Security Incident / Breach Notification</h2>
          <p>
            In the event of a security breach that compromises the confidentiality, integrity, or availability of
            personal information we hold, we will investigate promptly and notify affected Account Holders without
            unreasonable delay, and in accordance with the timelines and content requirements of the data breach
            notification law of the applicable U.S. state(s) where affected individuals reside. Where an
            End-Client's information is affected, we will notify the responsible Account Holder so they can, in
            turn, notify their own customers as required by law and as appropriate to their business.
          </p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">8. Children's Privacy</h2>
          <p>The Service is intended for business use by adults operating or working at an automotive repair business. It is not directed to, and we do not knowingly collect personal information from, individuals under 18 years of age.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. If we make material changes, we will notify Account Holders (for example, by email or an in-app notice) before the changes take effect. Continued use of the Service after a change becomes effective constitutes acceptance of the revised Policy.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">10. Governing Law</h2>
          <p>This Policy is governed by the laws of the State of {GOVERNING_STATE}, United States, without regard to its conflict-of-laws principles, except where superseded by applicable state or federal privacy law based on where you reside.</p>

          <h2 className="font-display text-xl font-bold uppercase tracking-wide mt-8">11. Contact Us</h2>
          <p>Questions about this Privacy Policy or how we handle information can be sent to <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.</p>
        </div>
      </div>
    </div>
  );
}
