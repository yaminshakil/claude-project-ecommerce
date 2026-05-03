<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@shopnow.com'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('admin123'),
                'role'     => 'super_admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@shopnow.com'],
            [
                'name'     => 'Test Customer',
                'password' => Hash::make('customer123'),
                'role'     => 'customer',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
