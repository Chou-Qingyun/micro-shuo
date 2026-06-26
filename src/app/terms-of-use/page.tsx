import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Read the Terms of Use for Sweet Chinese Romance, including account rules, reading access, comments, subscriptions, copyright, advertising, and acceptable use.",
  alternates: {
    canonical: "/terms-of-use",
  },
  openGraph: {
    title: "Terms of Use",
    description:
      "Rules for using Sweet Chinese Romance, including accounts, comments, bookmarks, subscriptions, and content access.",
    type: "website",
  },
};

const sections = [
  {
    title: "1. Acceptance of These Terms",
    content: [
      `By accessing or using ${siteConfig.name}, you agree to these Terms of Use and any policies referenced here. If you do not agree, please stop using the website.`,
      "These Terms apply to all visitors, readers, registered users, and anyone who submits comments or uses interactive features.",
    ],
  },
  {
    title: "2. About the Website",
    content: [
      `${siteConfig.name} provides an online reading experience focused on sweet romance novels, including CEO romance, transmigration romance, rebirth romance, and campus romance categories.`,
      "The website may include free reading pages, reader accounts, bookmarks, reading progress, comments, update subscriptions, advertisements, and related features.",
    ],
  },
  {
    title: "3. Accounts and Security",
    content: [
      "You may need an account to use features such as bookmarks, comments, reading progress, subscriptions, or profile settings.",
      "You are responsible for keeping your account credentials secure and for all activity under your account. Please notify the site operator if you believe your account has been used without permission.",
    ],
  },
  {
    title: "4. Reader Conduct",
    content: [
      "You agree not to misuse the website, interfere with its operation, attempt unauthorized access, scrape content at unreasonable volume, upload malicious files, impersonate others, or use the service for unlawful purposes.",
      "You also agree not to post spam, harassment, hate content, explicit abuse, threats, private personal information, or content that infringes someone else's rights.",
    ],
  },
  {
    title: "5. Comments and User Content",
    content: [
      "If you post comments, reader notes, profile information, or similar content, you are responsible for what you submit.",
      "By submitting user content, you grant the website a non-exclusive, worldwide, royalty-free license to host, display, reproduce, moderate, and use that content as needed to operate and promote the website.",
      "We may remove or restrict user content that violates these Terms, creates legal risk, disrupts the community, or harms the reading experience.",
    ],
  },
  {
    title: "6. Intellectual Property",
    content: [
      "The website design, branding, text, images, software, databases, and other materials are protected by copyright, trademark, and other laws unless otherwise stated.",
      "You may read content for personal, non-commercial use. You may not copy, republish, sell, distribute, mirror, translate, train models on, or exploit website content without permission from the rights holder.",
    ],
  },
  {
    title: "7. Copyright Complaints",
    content: [
      "If you believe content on the website infringes your copyright, please contact the site operator with enough detail to identify the work, the allegedly infringing material, your contact information, and a statement that you have a good-faith belief the use is unauthorized.",
      "We may remove or restrict access to content when appropriate and may terminate repeat infringers where required.",
    ],
  },
  {
    title: "8. Subscriptions and Notifications",
    content: [
      "Subscription features may allow you to receive updates about the website or specific novels. You are responsible for providing an email address that you control.",
      "You may unsubscribe from available update alerts through the website interface where this feature is provided.",
    ],
  },
  {
    title: "9. Advertising and Third-Party Links",
    content: [
      "The website may display advertising, including Google AdSense or similar advertising services if enabled. Advertisements and third-party links may lead to websites that we do not control.",
      "We are not responsible for third-party websites, products, services, privacy practices, or content.",
    ],
  },
  {
    title: "10. No Warranty",
    content: [
      "The website is provided on an as-is and as-available basis. We do not guarantee that the service will be uninterrupted, secure, error-free, or always available.",
      "We do not guarantee that novels, chapters, comments, update alerts, or account features will always remain available or unchanged.",
    ],
  },
  {
    title: "11. Limitation of Liability",
    content: [
      "To the fullest extent permitted by law, the site operator will not be liable for indirect, incidental, special, consequential, punitive, or exemplary damages arising from your use of the website.",
      "Your sole remedy for dissatisfaction with the website is to stop using it.",
    ],
  },
  {
    title: "12. Changes to the Website or Terms",
    content: [
      "We may update, suspend, remove, or change any part of the website at any time.",
      "We may also update these Terms from time to time. The updated version will be posted on this page with a revised effective date. Your continued use of the website after changes are posted means you accept the updated Terms.",
    ],
  },
  {
    title: "13. Governing Law",
    content: [
      "These Terms will be interpreted according to the laws applicable to the site operator, without regard to conflict-of-law principles, unless local consumer protection laws require otherwise.",
    ],
  },
  {
    title: "14. Contact",
    content: [
      "For questions about these Terms, copyright concerns, or account issues, please contact the site operator through the contact method provided on the website or through the domain owner contact channel.",
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="rounded-[8px] border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
          Legal
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-[#281f2d] sm:text-5xl">
          Terms of Use
        </h1>
        <p className="mt-3 text-sm text-[#7a6b76]">Effective date: June 26, 2026</p>
        <p className="mt-6 text-base leading-8 text-[#5f515f]">
          These Terms of Use govern your access to and use of {siteConfig.name}. Please read them
          carefully before using the website.
        </p>

        <div className="mt-8 grid gap-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-2xl font-semibold text-[#281f2d]">{section.title}</h2>
              <div className="mt-3 grid gap-3 text-sm leading-7 text-[#5f515f]">
                {section.content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 border-t border-rose-50 pt-5 text-sm text-[#7a6b76]">
          Please also review our{" "}
          <Link href="/privacy-policy" className="font-semibold text-[#9b405e]">
            Privacy Policy
          </Link>
          .
        </div>
      </article>
    </div>
  );
}
