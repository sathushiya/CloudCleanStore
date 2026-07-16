<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\CloudinaryService;
use Illuminate\Console\Command;
use Illuminate\Http\UploadedFile;

class AssignProductImages extends Command
{
    protected $signature = 'products:assign-images {path : Folder containing the image files}';
    protected $description = 'Uploads every image in the given folder to Cloudinary and assigns them to products, in filename order matched against product ID order.';

    public function handle(): int
    {
        $folder = rtrim($this->argument('path'), '/');

        if (!is_dir($folder)) {
            $this->error("Folder not found: {$folder}");
            return self::FAILURE;
        }

        $files = collect(scandir($folder))
            ->filter(fn ($f) => preg_match('/\.(jpg|jpeg|png|webp)$/i', $f))
            ->sort()
            ->values();

        $products = Product::whereNull('image')->orderBy('id')->get();

        if ($files->count() !== $products->count()) {
            $this->warn("Warning: {$files->count()} images found but {$products->count()} products have no image yet.");
            $this->warn('Continuing anyway -- extra images or extra products will just be left unmatched.');
        }

        $cloudinary = app(CloudinaryService::class);
        $count = min($files->count(), $products->count());

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        for ($i = 0; $i < $count; $i++) {
            $filePath = $folder . '/' . $files[$i];
            $product = $products[$i];

            $uploadedFile = new UploadedFile($filePath, $files[$i], null, null, true);
            $url = $cloudinary->uploadProductImage($uploadedFile);

            $product->update(['image' => $url]);

            $this->newLine();
            $this->line("  {$files[$i]}  ->  {$product->name} ({$product->brand->name})");

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Done. Assigned {$count} images.");
        $this->comment('Review the mapping above -- if any pairing looks wrong, fix it via the admin Edit Product screen.');

        return self::SUCCESS;
    }
}