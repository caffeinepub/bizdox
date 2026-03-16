import type { FormField, Theme } from "../backend";

interface DocumentPreviewRendererProps {
  templateName: string;
  fieldValues: Record<string, string>;
  fields: Array<FormField>;
  theme: Theme | null;
}

const DEFAULT_PRIMARY = "#1F6F43";
const DEFAULT_SECONDARY = "#C9A227";
const DEFAULT_FONT = "Inter, Roboto, sans-serif";

function getThemeStyles(theme: Theme | null) {
  return {
    primaryColor: theme?.primaryColor || DEFAULT_PRIMARY,
    secondaryColor: theme?.secondaryColor || DEFAULT_SECONDARY,
    fontFamily: theme?.fontFamily || DEFAULT_FONT,
    tableBorders: theme?.tableBorders ?? true,
  };
}

function getValue(
  fields: FormField[],
  fieldValues: Record<string, string>,
  ...labelKeywords: string[]
): string {
  const field = fields.find((f) =>
    labelKeywords.some((kw) =>
      f.fieldLabel.toLowerCase().includes(kw.toLowerCase()),
    ),
  );
  if (!field) return "";
  return fieldValues[field.fieldId] || field.defaultValue || "";
}

function getFieldsByKeywords(
  fields: FormField[],
  fieldValues: Record<string, string>,
  ...keywords: string[]
): Array<{ label: string; value: string }> {
  return fields
    .filter((f) =>
      keywords.some((kw) =>
        f.fieldLabel.toLowerCase().includes(kw.toLowerCase()),
      ),
    )
    .map((f) => ({
      label: f.fieldLabel,
      value: fieldValues[f.fieldId] || f.defaultValue || "—",
    }));
}

export function DocumentPreviewRenderer({
  templateName,
  fieldValues,
  fields,
  theme,
}: DocumentPreviewRendererProps) {
  const { primaryColor, secondaryColor, fontFamily, tableBorders } =
    getThemeStyles(theme);

  const docRef = `BDX-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const docDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const sellerName = getValue(fields, fieldValues, "seller name");
  const sellerAddress = getValue(fields, fieldValues, "seller address");
  const sellerCountry = getValue(fields, fieldValues, "seller country");
  const buyerName = getValue(fields, fieldValues, "buyer name");
  const buyerAddress = getValue(fields, fieldValues, "buyer address");
  const buyerCountry = getValue(fields, fieldValues, "buyer country");

  const commodityFields = getFieldsByKeywords(
    fields,
    fieldValues,
    "commodity",
    "grade",
    "origin",
    "quantity",
    "packaging",
  );

  const pricingFields = getFieldsByKeywords(
    fields,
    fieldValues,
    "price",
    "currency",
    "total",
    "value",
  );

  const shippingFields = getFieldsByKeywords(
    fields,
    fieldValues,
    "incoterm",
    "port",
    "shipment",
  );

  const termsFields = getFieldsByKeywords(
    fields,
    fieldValues,
    "payment terms",
    "inspection",
  );

  const remarks = getValue(fields, fieldValues, "remark");

  // Collect keys already shown
  const shownLabels = new Set([
    "seller name",
    "seller address",
    "seller country",
    "buyer name",
    "buyer address",
    "buyer country",
    ...commodityFields.map((f) => f.label.toLowerCase()),
    ...pricingFields.map((f) => f.label.toLowerCase()),
    ...shippingFields.map((f) => f.label.toLowerCase()),
    ...termsFields.map((f) => f.label.toLowerCase()),
    "remark",
    "remarks",
  ]);

  const additionalFields = fields
    .filter((f) => !shownLabels.has(f.fieldLabel.toLowerCase()))
    .map((f) => ({
      label: f.fieldLabel,
      value: fieldValues[f.fieldId] || f.defaultValue || "—",
    }));

  const borderStyle = tableBorders ? `1px solid ${primaryColor}40` : "none";
  const cellPad = "8px 12px";

  return (
    <div
      style={{
        fontFamily,
        color: "#2B2B2B",
        fontSize: "13px",
        lineHeight: "1.5",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: primaryColor,
          color: "#fff",
          padding: "24px 28px",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}
            >
              {sellerName || "SBZ Enterprises"}
            </div>
            {sellerAddress && (
              <div
                style={{ fontSize: "11px", opacity: 0.85, marginTop: "2px" }}
              >
                {sellerAddress}
                {sellerCountry ? `, ${sellerCountry}` : ""}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: secondaryColor,
              }}
            >
              {templateName}
            </div>
            <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px" }}>
              Ref: {docRef}
            </div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>
              Date: {docDate}
            </div>
          </div>
        </div>
      </div>

      {/* PARTIES TABLE */}
      {(sellerName || buyerName) && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: borderStyle,
            borderTop: "none",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  background: `${primaryColor}15`,
                  padding: cellPad,
                  textAlign: "left",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                  width: "50%",
                  borderRight: borderStyle,
                }}
              >
                Seller / Exporter
              </th>
              <th
                style={{
                  background: `${primaryColor}15`,
                  padding: cellPad,
                  textAlign: "left",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: primaryColor,
                  borderBottom: `2px solid ${primaryColor}`,
                  width: "50%",
                }}
              >
                Buyer / Importer
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  padding: cellPad,
                  verticalAlign: "top",
                  borderRight: borderStyle,
                  border: borderStyle,
                }}
              >
                {sellerName && (
                  <div style={{ fontWeight: "600" }}>{sellerName}</div>
                )}
                {sellerAddress && (
                  <div style={{ color: "#555", marginTop: "2px" }}>
                    {sellerAddress}
                  </div>
                )}
                {sellerCountry && (
                  <div
                    style={{
                      color: secondaryColor,
                      fontWeight: "600",
                      fontSize: "12px",
                      marginTop: "2px",
                    }}
                  >
                    {sellerCountry}
                  </div>
                )}
              </td>
              <td
                style={{
                  padding: cellPad,
                  verticalAlign: "top",
                  border: borderStyle,
                }}
              >
                {buyerName && (
                  <div style={{ fontWeight: "600" }}>{buyerName}</div>
                )}
                {buyerAddress && (
                  <div style={{ color: "#555", marginTop: "2px" }}>
                    {buyerAddress}
                  </div>
                )}
                {buyerCountry && (
                  <div
                    style={{
                      color: secondaryColor,
                      fontWeight: "600",
                      fontSize: "12px",
                      marginTop: "2px",
                    }}
                  >
                    {buyerCountry}
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* COMMODITY DETAILS */}
      {commodityFields.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div
            style={{
              background: primaryColor,
              color: "#fff",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Commodity Details
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: borderStyle,
            }}
          >
            <tbody>
              {commodityFields.map((f, i) => (
                <tr
                  key={f.label}
                  style={{
                    background: i % 2 === 0 ? `${primaryColor}08` : "#fff",
                  }}
                >
                  <td
                    style={{
                      padding: cellPad,
                      fontWeight: "600",
                      color: primaryColor,
                      width: "35%",
                      borderRight: borderStyle,
                      border: borderStyle,
                    }}
                  >
                    {f.label}
                  </td>
                  <td style={{ padding: cellPad, border: borderStyle }}>
                    {f.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PRICING */}
      {pricingFields.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div
            style={{
              background: secondaryColor,
              color: "#fff",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Pricing
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: borderStyle,
            }}
          >
            <tbody>
              {pricingFields.map((f, i) => (
                <tr
                  key={f.label}
                  style={{
                    background: i % 2 === 0 ? `${secondaryColor}10` : "#fff",
                  }}
                >
                  <td
                    style={{
                      padding: cellPad,
                      fontWeight: "600",
                      color: secondaryColor,
                      width: "35%",
                      border: borderStyle,
                    }}
                  >
                    {f.label}
                  </td>
                  <td
                    style={{
                      padding: cellPad,
                      fontWeight: "500",
                      border: borderStyle,
                    }}
                  >
                    {f.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SHIPPING & TERMS */}
      {(shippingFields.length > 0 || termsFields.length > 0) && (
        <div style={{ marginTop: "16px" }}>
          <div
            style={{
              background: primaryColor,
              color: "#fff",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Shipping & Terms
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: borderStyle,
            }}
          >
            <tbody>
              {[...shippingFields, ...termsFields].map((f, i) => (
                <tr
                  key={f.label}
                  style={{
                    background: i % 2 === 0 ? `${primaryColor}08` : "#fff",
                  }}
                >
                  <td
                    style={{
                      padding: cellPad,
                      fontWeight: "600",
                      color: primaryColor,
                      width: "35%",
                      border: borderStyle,
                    }}
                  >
                    {f.label}
                  </td>
                  <td style={{ padding: cellPad, border: borderStyle }}>
                    {f.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REMARKS */}
      {remarks && (
        <div style={{ marginTop: "16px" }}>
          <div
            style={{
              background: `${primaryColor}15`,
              border: `1px solid ${primaryColor}30`,
              borderRadius: "4px",
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: primaryColor,
                marginBottom: "4px",
              }}
            >
              Remarks
            </div>
            <div style={{ color: "#444" }}>{remarks}</div>
          </div>
        </div>
      )}

      {/* ADDITIONAL FIELDS */}
      {additionalFields.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div
            style={{
              background: "#F5F6F8",
              border: borderStyle,
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              color: "#555",
            }}
          >
            Additional Details
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: borderStyle,
            }}
          >
            <tbody>
              {additionalFields.map((f, i) => (
                <tr
                  key={f.label}
                  style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}
                >
                  <td
                    style={{
                      padding: cellPad,
                      fontWeight: "600",
                      color: "#555",
                      width: "35%",
                      border: borderStyle,
                    }}
                  >
                    {f.label}
                  </td>
                  <td style={{ padding: cellPad, border: borderStyle }}>
                    {f.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FOOTER */}
      <div
        style={{
          marginTop: "24px",
          borderTop: `2px solid ${primaryColor}`,
          paddingTop: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div style={{ fontSize: "10px", color: "#888" }}>
          <div>{templateName}</div>
          <div style={{ marginTop: "2px" }}>
            BizDox powered by SBZ Enterprises
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              borderTop: "1px solid #2B2B2B",
              paddingTop: "4px",
              minWidth: "160px",
              fontSize: "10px",
              color: "#555",
              textAlign: "center",
            }}
          >
            Authorized Signature
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreviewRenderer;
