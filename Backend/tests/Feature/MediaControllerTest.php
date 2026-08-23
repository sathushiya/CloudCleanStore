<?php

namespace Tests\Feature;

use App\Services\CloudinaryService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class MediaControllerTest extends TestCase
{
    use RefreshDatabase;

    // UploadedFile::fake()->image() needs the GD extension to render real
    // pixel data; ->create() with an explicit mime type satisfies the
    // 'image' validation rule without that dependency.
    private function fakeImage(string $name = 'logo.jpg', int $kilobytes = 100): UploadedFile
    {
        return UploadedFile::fake()->create($name, $kilobytes, 'image/jpeg');
    }

    public function test_guest_cannot_upload_media(): void
    {
        $response = $this->postJson('/api/admin/media/upload', [
            'image' => $this->fakeImage(),
        ]);

        $response->assertUnauthorized();
    }

    public function test_customer_cannot_upload_media(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/admin/media/upload', [
            'image' => $this->fakeImage(),
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_upload_an_image_and_receives_its_url(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->mock(CloudinaryService::class, function ($mock) {
            $mock->shouldReceive('uploadProductImage')
                ->once()
                ->andReturn('https://res.cloudinary.com/demo/image/upload/v1/test.jpg');
        });

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/media/upload', [
            'image' => $this->fakeImage(),
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'data' => ['url' => 'https://res.cloudinary.com/demo/image/upload/v1/test.jpg'],
        ]);
    }

    public function test_upload_rejects_a_non_image_file(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/media/upload', [
            'image' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
        ]);

        $response->assertUnprocessable();
    }

    public function test_upload_rejects_a_file_over_the_size_limit(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/media/upload', [
            'image' => $this->fakeImage('huge.jpg', 6000), // over the 5120 KB limit
        ]);

        $response->assertUnprocessable();
    }
}
