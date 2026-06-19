const faqs = [
  ["How do I place an order?", "Browse the shop, add items to cart, login or create an account, and complete checkout with your preferred payment method."],
  ["Do you deliver islandwide?", "Yes, the Berry storefront is prepared around islandwide Sri Lankan delivery."],
  ["What payment methods are available?", "Available Payment Options: Cash on Delivery, Bank Deposit, Online Card Payment."],
  ["What happens if I choose Bank Deposit?", "You will see a receipt upload field during checkout. Admin can later verify or reject the payment in the admin panel."],
  ["Can I exchange sizes?", "A return and exchange policy page is included to guide the final business workflow."],
  ["Will I receive order updates?", "Yes, the frontend includes an email-template plan for automated confirmations and status updates later."]
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h1 className="font-display text-5xl text-ink">Frequently Asked Questions</h1>
        <div className="mt-8 space-y-4">
          {faqs.map(([question, answer]) => (
            <div key={question} className="rounded-[24px] bg-[#fff6f5] p-5">
              <p className="font-semibold text-ink">{question}</p>
              <p className="mt-2 text-sm leading-7 text-black/65">{answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
