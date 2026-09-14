import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import type { CartLine } from "../../types";
import { formatCurrency } from "../../lib/formatCurrency";
import { QuantityStepper } from "../ui/QuantityStepper";
import { useProduct } from "../../hooks/useProducts";
import { useRemoveCartItem, useUpdateCartItem } from "../../hooks/useCart";
import { VariantSelector } from "../product/VariantSelector";
import { useToast } from "../ui/Toast";
import { extractErrorMessage } from "../../api/client";

export function CartLineItem({ line }: { line: CartLine }) {
  const [editingVariant, setEditingVariant] = useState(false);
  const { data: fullProduct } = useProduct(editingVariant ? line.product._id : undefined);
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const { showToast } = useToast();

  const variantText = Object.entries(line.variantSelection)
    .map(([axis, value]) => `${axis}: ${value}`)
    .join(" · ");

  async function handleQuantityChange(next: number) {
    try {
      await updateItem.mutateAsync({ itemId: line.itemId, updates: { quantity: next } });
    } catch (err) {
      showToast(extractErrorMessage(err, "Could not update quantity"), "error");
    }
  }

  async function handleRemove() {
    try {
      await removeItem.mutateAsync(line.itemId);
    } catch (err) {
      showToast(extractErrorMessage(err, "Could not remove item"), "error");
    }
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border py-4 sm:flex-row sm:items-start">
      <Link to={`/products/${line.product._id}`} className="focus-ring h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-black/5">
        <img src={line.product.thumbnail} alt={line.product.title} className="h-full w-full object-cover" />
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to={`/products/${line.product._id}`} className="focus-ring font-heading text-sm font-semibold text-ink">
              {line.product.title}
            </Link>
            {variantText && (
              <p className="mt-0.5 text-xs text-muted">
                {variantText}{" "}
                <button
                  onClick={() => setEditingVariant((v) => !v)}
                  className="focus-ring ml-1 text-accent underline underline-offset-2"
                >
                  Edit
                </button>
              </p>
            )}
          </div>
          <p className="text-sm font-semibold tabular-nums text-ink">{formatCurrency(line.subtotal)}</p>
        </div>

        {editingVariant && fullProduct && (
          <div className="rounded-md border border-border p-3">
            <VariantSelector
              axes={fullProduct.variants}
              selection={line.variantSelection}
              onChange={async (next) => {
                try {
                  await updateItem.mutateAsync({ itemId: line.itemId, updates: { variantSelection: next } });
                  setEditingVariant(false);
                } catch (err) {
                  showToast(extractErrorMessage(err, "Could not update selection"), "error");
                }
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <QuantityStepper
            value={line.quantity}
            max={Math.max(line.availableStock, line.quantity)}
            onChange={handleQuantityChange}
            disabled={updateItem.isPending}
          />
          <button
            onClick={handleRemove}
            aria-label={`Remove ${line.product.title} from cart`}
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-md text-muted hover:bg-danger/5 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
