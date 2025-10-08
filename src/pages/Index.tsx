import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Pen, Square, Circle, Plus, Minus, Sparkles } from 'lucide-react';

type Tool = 'brush' | 'rect' | 'circle';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [demoImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d2?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop'
  ]);
  const [selectedTool, setSelectedTool] = useState<Tool>('brush');
  const [brushSize, setBrushSize] = useState<number>(50);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mask, setMask] = useState<ImageData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (selectedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedImage;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        if (maskCanvasRef.current) {
          maskCanvasRef.current.width = img.width;
          maskCanvasRef.current.height = img.height;
        }
      };
    }
  }, [selectedImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImage(result);
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;

    if (selectedTool === 'brush') {
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (selectedTool === 'rect') {
      ctx.fillRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
    } else if (selectedTool === 'circle') {
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleGenerate = () => {
    console.log('Generating result...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
          {/* Left Panel */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">点击上传</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">上传图片</div>
                <div className="text-sm font-medium text-gray-700">示例图片</div>
                <div className="grid grid-cols-2 gap-3">
                  {demoImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Demo ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tools Section */}
            <div className="space-y-4">
              <Tabs defaultValue="select" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="select">选区工具</TabsTrigger>
                  <TabsTrigger value="ai">智能识别文字水印</TabsTrigger>
                </TabsList>
                <TabsContent value="select" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={selectedTool === 'brush' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => setSelectedTool('brush')}
                    >
                      <Pen className="w-5 h-5" />
                      <span className="text-xs">笔刷</span>
                    </Button>
                    <Button
                      variant={selectedTool === 'rect' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => setSelectedTool('rect')}
                    >
                      <Square className="w-5 h-5" />
                      <span className="text-xs">框选</span>
                    </Button>
                    <Button
                      variant={selectedTool === 'circle' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => setSelectedTool('circle')}
                    >
                      <Circle className="w-5 h-5" />
                      <span className="text-xs">圈选</span>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => clearMask()}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">去除选区</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button size="icon" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">增加选区</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">笔刷大小</span>
                      <span className="text-sm font-medium">{brushSize}</span>
                    </div>
                    <Slider
                      value={[brushSize]}
                      onValueChange={(value) => setBrushSize(value[0])}
                      min={10}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="ai">
                  <div className="text-sm text-gray-500 text-center py-8">
                    AI智能识别功能
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Generate Button */}
            <Button
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-full relative overflow-hidden"
              onClick={handleGenerate}
            >
              <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">
                瞬时生成
              </span>
              立即生成
            </Button>
          </div>

          {/* Right Panel - Canvas */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI消除·一键消除</h1>
                <p className="text-gray-600 mt-2">擦除图片中的指定区域，移除多余物体或水印</p>
              </div>

              <div className="relative bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <canvas
                  ref={maskCanvasRef}
                  className="absolute inset-0 w-full h-full object-contain cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                {!selectedImage && (
                  <div className="text-center text-gray-400">
                    <Sparkles className="w-16 h-16 mx-auto mb-4" />
                    <p>请上传或选择一张图片开始</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;