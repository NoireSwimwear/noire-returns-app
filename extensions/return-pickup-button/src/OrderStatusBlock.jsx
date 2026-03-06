// extensions/return-pickup-button/src/OrderStatusBlock.jsx
import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";

/** Backend API (Render) */
const API_BASE = "https://noire-returns-app.onrender.com";

/** Pagina ta Shopify */
const PICKUP_PAGE_URL = "https://noire-swimwear.ro/pages/retur-pick-up";

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const shop =
    typeof shopify !== "undefined" ? /** @type {any} */ (shopify) : null;

  const [loading, setLoading] = useState(true);
  const [hasReturnInProgress, setHasReturnInProgress] = useState(false);

  const countryCode =
    shop?.localization?.country?.value?.isoCode ||
    shop?.localization?.country?.isoCode ||
    shop?.localization?.country?.code ||
    shop?.localization?.country?.value?.code ||
    "unknown";

  const isRO = countryCode === "RO";

  const order = shop?.order?.value || null;
  const orderId = order?.id || null;

  const getSessionToken = useMemo(() => {
    return shop?.sessionToken?.get
      ? shop.sessionToken.get.bind(shop.sessionToken)
      : null;
  }, [shop?.sessionToken]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);

        if (!shop || !isRO || !orderId || !getSessionToken) {
          if (!cancelled) setHasReturnInProgress(false);
          return;
        }

        const token = await getSessionToken();
        if (!token) {
          if (!cancelled) setHasReturnInProgress(false);
          return;
        }

        const url = `${API_BASE}/api/returns/check?orderId=${encodeURIComponent(orderId)}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error();

        if (!cancelled) {
          setHasReturnInProgress(Boolean(data?.hasReturnInProgress));
        }
      } catch {
        if (!cancelled) setHasReturnInProgress(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [shop, isRO, orderId, getSessionToken]);

  const handleClick = () => {
    window.open(PICKUP_PAGE_URL, "_self");
  };

  if (loading || !isRO || !hasReturnInProgress) return null;

  return (
    <s-stack
      background="base"
      border="base"
      border-radius="300"
      padding="large"
    >
      <s-stack gap="base">
        <s-text>Poți programa ridicarea coletului prin Fan Courier.</s-text>
        <s-button variant="primary" onClick={handleClick}>
          Programează ridicarea coletului
        </s-button>
      </s-stack>
    </s-stack>
  );
}
