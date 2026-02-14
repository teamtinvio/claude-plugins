### Bank Feeds - Aspire
Source: https://help.jaz.ai/en/articles/9857456-bank-feeds-aspire

**Q1. Is it possible to directly integrate my Bank Account with Jaz?**

- Yes! You can easily integrate your bank account with Jaz & get all the transactions to reconcile.
- Select a bank account that you want to connect with the external bank account to get regular bank feeds.
- This can be done from the Reconciliation module, select the desired bank account & import the bank feeds.

**Q2. Is it easy to set up bank feeds on Jaz?**

- The bank feeds setup is pretty straightforward & easy on Jaz.
- Once you have selected the Bank Account from step 1 of the bank feed import process, you will need to retrieve the Client ID & API Key from the Aspire account to key into the 2nd step.
  - If you don't have access to your Aspire account to retrieve these 2 pieces of information, your client will need to be the one doing it.
  - Here's the link on how to [retrieve the Client ID and API Key from Aspire](https://distinctive-islamabad-581543bddaef.herokuapp.com/b?y=49q24eh2clh38d1nc8pm8dhj6kom8phocko3ac9g68sjadpl6tj38dpn74h2o8ji48t24q3keho76ehf5ti6isrkd5n66t39epiiqqbjdhgmqob2c5i2qd9o64qj8cr2chi62pb65pk6asjfddqm2s3g5phmur9fc8vnif9k75oj4d35d0p66rrg6cs68qhl6pk6kcr9cksmuorgd4r38s3a6hhmeshjd5ij2r336ll3cd336cpjecb96dgmushiccq6gcjf71l6id1oegp38s9jddimgrpn6pimgphlehk6qtbjd9im6r3969on2oj5cdq6irbjehh3ipb8edkn2s1hdlhmesba6hnjiqhm75k3cd3565kjas3b6pgn6qj6chi72r9iecpmedbgd1mnashpcphjgtjed5j3iqpn6lnmkd346cqm8c3g6dhn0sja6phn0dhoecpm2djfe5mmasb8dlhmgqpmeli6gs3471p36org75k68r38d8s76ebdccqmgrbbcdl36dj8dtmmms3icpi32r1jcli64e1mdtp3ec3hd1kjcsrf6pjm6qj66somodj9cgomupb7e0pjgsppd9i68qbdctp70rhme1kmqprgd1m6aq3g6pomuoj6ccsmodj1cdh64p3fe4rj0pb26lhmgrpmedp6grr56lk3corg6dj68rrid9hn6ohichi6grbde9l64orcdsr38s326di6grpjcdhmkqpmcdpmqe3j6dgm8dbfdop76q3ccdnn2rhge5h6gp9ld0r62p32ccr32rhjcdpn0qhn6lkmkqbhc8smadbadkp70s3g6pk6qrbde9h6eoppdspm2shhe1i6urpmelnmgqj3chm6qsbhd1mm6qrjdoo6us3fckq74cr7ecomkdj4d1mmes9hdkr6gq9mcton0rb5cho6kor56cqjcorgd9hn6sja6pnn0dhme5k6kdjfecrj4ori6tij2q1jc5i6gq3465m3cdjfe9jjce3860ujqf9t48======). You can send it to your client and get them to retrieve the API Key and Client ID for you.
- Once done with step 2, you'll move to the final step where you can select the bank account and select the date to pull the bank feeds from.

**Q3. Why can't I select dates older than 12 months from today?**

- You can pull in bank feeds only up to 12 months from today in Jaz.

**Q4. How can I re-sync my bank feeds?**

- Select the desired bank account from the reconciliation module and hit the sync icon on the bank feed details modal, to get new statement lines to Jaz for reconciling.

**Q5. How can I disconnect a bank account from Jaz?**

- Simply hit disconnect on the bank feed details modal, to disconnect the connected bank.
- This will stop further bank feeds from getting populated in Jaz.
- This will also allow you to connect the same bank account to another Jaz bank account.

**Q6. Why can't I see all of my bank accounts while trying to integrate with Jaz?**

- Please check the currencies of the Jaz bank account & the 3rd party bank account you are trying to integrate with.
- Jaz restricts cross-currency bank account integrations.

**Q7. Which bank feeds are supported by Jaz currently?**

- Currently, Jaz only supports Aspire bank feeds.

---

### PDF Templates
Source: https://help.jaz.ai/en/articles/10483242-pdf-templates

**Q1. What transactions can I customize?**

- You can customize PDF templates for the following transactions:
  - Invoices
    - Note: Delivery Slip and Quotation PDFs will use the invoice template set for the transaction.
  - Invoice Payments
  - Customer Credits
  - Customer Refunds

**Q2. How can I create a new PDF template?**

- Navigate to Settings > Templates > PDFs > Choose a tab: Invoices or Customer Credits and click on Create New Template.

**Q3. What sections in the PDF can I edit?**

- You can edit the following sections within a PDF:
  - **General**Choose from 4 template styles (Classic, Overlay, Smooth, Formal), customize template name, colors, fonts, and add a unique logo per template.
  - **Header**Customize title, document details, references, dates, terms, company info, contact details, GST/VAT ID, delivery, and address format.
  - **Table**Enable/disable tax info, adjust row spacing (Standard, Compact, Relaxed), and customize column headers, widths, and visibility.
  - **Total**Enable/disable the total section, adjust spacing, configure balance labels, and add a tax summary for detailed breakdowns.
  - **Footer**Enable payment options for invoices and edit note titles for both invoices and customer credits.
- To apply the changes made in these sections, click **Update Preview**.**Q4. Can I duplicate templates or organize them?**

- Yes, you can duplicate templates.

**Q5. What are default templates, and how do they work?**

- There are two types of default templates:
  - **Template default for the organization:**This is the default for all contacts unless a specific contact default is set.
  - **Template default for the contact:** This is applied when a contact is selected during transaction creation or editing, overriding the organization default if specified.
- These defaults automatically apply to new transactions.

**Q6. Can I set default PDF templates during the contact import process?**

- Yes, default templates can be assigned during contact import. The contact import template includes columns for selecting a PDF template per contact.

**Q7. What happens if I update an existing template?**

- Updating a template applies changes to future transactions but previous PDFs remain unaffected.

---

### Sending Invoices
Source: https://help.jaz.ai/en/articles/9638534-sending-invoices

**Q1. How can I send an invoice or invoice payment receipt to a customer?**

- There are two main ways you can send an invoice or invoice payment receipt to a customer:
- Download the invoice or invoice payment receipt , and send it manually to a customer.
- When creating an invoice or invoice payment receipt , click on the **mail icon** to enable automatic sending of invoices to the selected contact.
  - Do note that the selected contact needs to have an email added under their contact.

**Q2. Can I send an invoice or invoice payment receipt to multiple emails at once?**

- When sending out an invoice or invoice payment receipt, if the selected contact has multiple emails listed within their details, the invoice or invoice payment receipt will be sent to all of the emails listed.
- As such, if you would like to send an invoice or invoice payment receipts to multiple emails at once, you will need to add in multiple emails within the contact details.
- For more information on setting up multiple emails up for a contact, refer to [Contacts](https://help.jaz.ai/en/articles/8938009-contacts)

**Q3. Can I still select or modify what emails the invoice or invoice payment receipts are sent out to?**

- Yes, you can still make adjustments before sending.
- After clicking **Enable Email**, you will see the full list of emails used for the contact, where the invoice or invoice payment receipt will be sent out to.
- You can remove an email from the list of recipients by clicking on the **x**icon beside their email.

**Q3. Can I also have a copy of the invoice sent to me and my organizations' users when I send it out to customers?**

- Yes! You can do this by adding internal emails.
- To do so, click on the mail icon when creating an invoice or invoice payment, and you should see **Email Settings.**
- Within **Email Settings**, you can add in one or more emails to be CCed when invoices or invoice payment receipts are automatically sent out to customers.
  - To add in multiple emails, type in one email, press **Enter**, and key in the next.

---
