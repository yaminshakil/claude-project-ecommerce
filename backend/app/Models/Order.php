<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'subtotal',
        'discount_amount',
        'shipping_fee',
        'tax_amount',
        'total',
        'coupon_id',
        'coupon_code',
        'payment_method',
        'payment_status',
        'payment_intent_id',
        'shipping_address',
        'notes',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal'        => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'shipping_fee'    => 'decimal:2',
            'tax_amount'      => 'decimal:2',
            'total'           => 'decimal:2',
            'shipping_address'=> 'array',
            'delivered_at'    => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
