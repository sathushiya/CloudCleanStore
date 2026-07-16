<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function __construct(private CloudinaryService $cloudinary)
    {
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'max:5120']]);

        try {
            $url = $this->cloudinary->uploadProductImage($request->file('image'));

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully.',
                'data' => ['url' => $url],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Image upload failed: ' . $e->getMessage()], 500);
        }
    }
}