<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'short_description',
        'description',
        'price',
        'compare_price',
        'sku',
        'stock',
        'low_stock_threshold',
        'category_id',
        'brand_id',
        'weight',
        'dimensions',
        'is_featured',
        'is_active',
        'views_count',
    ];

    protected function casts(): array
    {
        return [
            'price'               => 'decimal:2',
            'compare_price'       => 'decimal:2',
            'stock'               => 'integer',
            'low_stock_threshold' => 'integer',
            'views_count'         => 'integer',
            'weight'              => 'decimal:2',
            'dimensions'          => 'array',
            'is_featured'         => 'boolean',
            'is_active'           => 'boolean',
        ];
    }

    // Accessors

    public function getDiscountPercentageAttribute(): int
    {
        if (empty($this->compare_price) || $this->compare_price <= 0) {
            return 0;
        }

        if ($this->price >= $this->compare_price) {
            return 0;
        }

        return (int) round((($this->compare_price - $this->price) / $this->compare_price) * 100);
    }

    // Relationships

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'wishlists')->withTimestamps();
    }
}
