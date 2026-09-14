import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  useAdminProduct,
  useCreateAdminProduct,
  useDeleteAdminProduct,
  useUpdateAdminProduct,
} from "../../hooks/useAdminProducts";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { VariantAxisEditor } from "../../components/admin/VariantAxisEditor";
import { Button } from "../../components/ui/Button";
import { PageSpinner } from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";
import { extractErrorMessage, extractFieldErrors } from "../../api/client";
import { slugify } from "../../lib/slugify";
import type { VariantAxis } from "../../types";

const KNOWN_CATEGORIES = ["T-Shirts", "Hoodies", "Jackets", "Pants", "Footwear", "Accessories"];

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: existing, isLoading } = useAdminProduct(id);
  const createProduct = useCreateAdminProduct();
  const updateProduct = useUpdateAdminProduct();
  const deleteProduct = useDeleteAdminProduct();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [baseStock, setBaseStock] = useState(0);
  const [variants, setVariants] = useState<VariantAxis[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setSlug(existing.slug);
      setSlugTouched(true);
      setPrice((existing.price / 100).toFixed(2));
      setDescription(existing.description);
      setCategory(existing.category);
      setImages(existing.images);
      setBaseStock(existing.baseStock);
      setVariants(existing.variants);
    }
  }, [existing]);

  if (isEditing && isLoading) return <PageSpinner />;

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const cents = Math.round(parseFloat(price || "0") * 100);
    const payload = {
      slug,
      title,
      price: cents,
      description,
      category,
      images,
      thumbnail: images[0] ?? "",
      baseStock: variants.length === 0 ? baseStock : 0,
      variants,
    };

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: id!, payload });
        showToast("Product updated");
      } else {
        await createProduct.mutateAsync(payload);
        showToast("Product created");
      }
      navigate("/admin");
    } catch (err) {
      const perField = extractFieldErrors(err);
      if (Object.keys(perField).length > 0) {
        setFieldErrors(perField);
      } else {
        setError(extractErrorMessage(err, "Could not save this product."));
      }
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      await deleteProduct.mutateAsync(id);
      showToast("Product deleted");
      navigate("/admin");
    } catch (err) {
      showToast(extractErrorMessage(err, "Could not delete this product."), "error");
    }
  }

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/admin" className="focus-ring mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Dashboard
      </Link>

      <h1 className="font-heading text-2xl font-bold text-ink">{isEditing ? "Edit Product" : "Add Product"}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-ink">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
            />
            {fieldErrors.title && <p className="mt-1 text-xs text-danger">{fieldErrors.title}</p>}
          </div>

          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium text-ink">
              Slug
            </label>
            <input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className="focus-ring h-11 w-full rounded-md border border-border px-3 font-mono text-sm"
            />
            {fieldErrors.slug && <p className="mt-1 text-xs text-danger">{fieldErrors.slug}</p>}
          </div>

          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium text-ink">
              Price (USD)
            </label>
            <input
              id="price"
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
            />
            {fieldErrors.price && <p className="mt-1 text-xs text-danger">{fieldErrors.price}</p>}
          </div>

          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-ink">
              Category
            </label>
            <input
              id="category"
              list="category-options"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
            />
            <datalist id="category-options">
              {KNOWN_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {fieldErrors.category && <p className="mt-1 text-xs text-danger">{fieldErrors.category}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-ink">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="focus-ring w-full rounded-md border border-border px-3 py-2 text-sm"
          />
          {fieldErrors.description && <p className="mt-1 text-xs text-danger">{fieldErrors.description}</p>}
        </div>

        <ImageUploader label="Product Images" images={images} onChange={setImages} />
        {fieldErrors.images && <p className="text-xs text-danger">{fieldErrors.images}</p>}

        {variants.length === 0 && (
          <div className="max-w-[160px]">
            <label htmlFor="baseStock" className="mb-1 block text-sm font-medium text-ink">
              Stock
            </label>
            <input
              id="baseStock"
              type="number"
              min={0}
              value={baseStock}
              onChange={(e) => setBaseStock(Math.max(0, Number(e.target.value)))}
              className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
            />
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Variants (optional)</p>
          <VariantAxisEditor variants={variants} onChange={setVariants} />
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 border-t border-border pt-5">
          <Button type="submit" size="lg" isLoading={isSaving}>
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>

          {isEditing && (
            <div className="ml-auto flex items-center gap-2">
              {confirmingDelete ? (
                <>
                  <span className="text-sm text-muted">Delete this product?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteProduct.isPending}
                    className="focus-ring rounded-md bg-danger px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-danger hover:bg-danger/5"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete Product
                </button>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
