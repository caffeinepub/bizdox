import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Copy, Loader2, QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Variant_pdf_docx_xlsx } from "../backend";
import type { Theme } from "../backend";
import { useActor } from "../hooks/useActor";
import {
  type DocField,
  downloadBlob,
  generateDOCX,
  generatePDF,
  generateXLSX,
} from "../lib/documentGenerator";

const UPI_ID = "919188520881@federal";
const AMOUNT = "1.00";
const UPI_LINK = `upi://pay?pa=${UPI_ID}&pn=BizDox&am=${AMOUNT}&cu=INR&tn=Document+Download`;
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(UPI_LINK)}`;

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
  format: "pdf" | "docx" | "xlsx";
  fields: DocField[];
  theme?: Theme;
}

export default function PaymentModal({
  open,
  onClose,
  documentId,
  documentTitle,
  format,
  fields,
  theme,
}: PaymentModalProps) {
  const { actor } = useActor();
  const [step, setStep] = useState<"payment" | "txn">("payment");
  const [txnId, setTxnId] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("UPI ID copied!");
  };

  const handleConfirm = async () => {
    if (!actor || !txnId.trim()) {
      toast.error("Please enter the transaction ID");
      return;
    }
    setLoading(true);
    try {
      const payment = await actor.recordPayment(documentId, BigInt(1), "INR");
      await actor.confirmPayment(payment.paymentId, txnId.trim());

      const formatEnum =
        format === "pdf"
          ? Variant_pdf_docx_xlsx.pdf
          : format === "docx"
            ? Variant_pdf_docx_xlsx.docx
            : Variant_pdf_docx_xlsx.xlsx;

      await actor.recordExport(documentId, formatEnum, payment.paymentId);

      // Generate file
      let blob: Blob;
      const safeTitle = documentTitle || "BizDox-Document";
      if (format === "docx") {
        blob = await generateDOCX(safeTitle, fields, theme);
      } else if (format === "xlsx") {
        blob = await generateXLSX(safeTitle, fields);
      } else {
        blob = await generatePDF(safeTitle, fields, theme);
      }

      downloadBlob(blob, `${safeTitle}.${format}`);
      toast.success("Document downloaded successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Payment confirmation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("payment");
    setTxnId("");
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-ocid="payment.dialog" className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-primary">
            Complete Payment
          </DialogTitle>
        </DialogHeader>

        {step === "payment" ? (
          <div className="space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-lg">
                ₹{AMOUNT}
                <span className="text-sm font-normal text-muted-foreground">
                  per download
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="p-3 bg-white border-2 border-border rounded-xl shadow-card">
                <img
                  src={QR_URL}
                  alt="UPI QR Code"
                  className="w-48 h-48"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden",
                    );
                  }}
                />
                <div className="hidden w-48 h-48 flex items-center justify-center bg-muted rounded">
                  <QrCode className="w-16 h-16 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-4">
              <Label className="text-xs text-muted-foreground">UPI ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 text-sm font-mono font-semibold">
                  {UPI_ID}
                </code>
                <Button
                  data-ocid="payment.copy_button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-7 px-2"
                >
                  {copied ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Scan the QR code or copy the UPI ID to pay ₹1 for your download.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                data-ocid="payment.cancel_button"
              >
                Cancel
              </Button>
              <Button
                data-ocid="payment.paid_button"
                onClick={() => setStep("txn")}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                I Have Paid
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">
                Payment Received!
              </p>
              <p className="text-xs text-green-600">
                Enter your UPI transaction ID to confirm.
              </p>
            </div>

            <div>
              <Label htmlFor="txnId">UPI Transaction ID *</Label>
              <Input
                id="txnId"
                data-ocid="payment.txn_id.input"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
                placeholder="e.g. 123456789012"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find this in your UPI app payment history.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("payment")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                data-ocid="payment.confirm_button"
                onClick={handleConfirm}
                disabled={loading || !txnId.trim()}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Confirm & Download
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
