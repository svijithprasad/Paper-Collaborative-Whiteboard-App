import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Pen, Square, Circle, Type, Eraser, Download, Users, Palette, Move } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { DrawingElement } from '../types';

interface WhiteboardProps {
  onBack: () => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentWhiteboard, currentTeam } = useApp();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tool, setTool] = useState<string>('pen');
  const [color, setColor] = useState('#3B82F6');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);

  const tools = [
    { id: 'pen', name: 'Pen', icon: Pen },
    { id: 'rectangle', name: 'Rectangle', icon: Square },
    { id: 'circle', name: 'Circle', icon: Circle },
    { id: 'text', name: 'Text', icon: Type },
    { id: 'select', name: 'Select', icon: Move },
    { id: 'eraser', name: 'Eraser', icon: Eraser },
  ];

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#6B7280', '#000000'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Set canvas properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas with grid background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Redraw all elements
    elements.forEach(element => drawElement(ctx, element));
    
    // Draw selection highlight
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      if (element) {
        drawSelection(ctx, element);
      }
    }
  }, [elements]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawSelection = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    if (element.type === 'rectangle' && element.width && element.height) {
      ctx.strokeRect(element.x - 5, element.y - 5, element.width + 10, element.height + 10);
    } else if (element.type === 'circle' && element.width) {
      const radius = Math.abs(element.width) / 2;
      ctx.beginPath();
      ctx.arc(
        element.x + element.width / 2,
        element.y + element.width / 2,
        radius + 5,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color + '40'; // Add transparency for fill
    ctx.lineWidth = element.strokeWidth;

    switch (element.type) {
      case 'pen':
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;
      case 'rectangle':
        if (element.width && element.height) {
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
        break;
      case 'circle':
        if (element.width) {
          const radius = Math.abs(element.width) / 2;
          ctx.beginPath();
          ctx.arc(
            element.x + element.width / 2,
            element.y + element.width / 2,
            radius,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.stroke();
        }
        break;
      case 'text':
        if (element.text) {
          ctx.font = `${element.strokeWidth * 8}px Arial`;
          ctx.fillStyle = element.color;
          ctx.fillText(element.text, element.x, element.y);
        }
        break;
    }
  };

  const getElementAt = (x: number, y: number): DrawingElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      
      if (element.type === 'rectangle' && element.width && element.height) {
        if (x >= element.x && x <= element.x + element.width &&
            y >= element.y && y <= element.y + element.height) {
          return element;
        }
      } else if (element.type === 'circle' && element.width) {
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.width / 2;
        const radius = Math.abs(element.width) / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distance <= radius) {
          return element;
        }
      }
    }
    return null;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPos({ x, y });

    if (tool === 'select') {
      const element = getElementAt(x, y);
      if (element) {
        setSelectedElement(element.id);
        setIsDragging(true);
      } else {
        setSelectedElement(null);
      }
      return;
    }

    if (tool === 'eraser') {
      const element = getElementAt(x, y);
      if (element) {
        setElements(prev => prev.filter(el => el.id !== element.id));
      }
      return;
    }

    setIsDrawing(true);
    setSelectedElement(null);

    if (tool === 'pen') {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'pen',
        x,
        y,
        points: [{ x, y }],
        color,
        strokeWidth,
      };
      setElements(prev => [...prev, newElement]);
    } else if (tool === 'rectangle' || tool === 'circle') {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: tool as 'rectangle' | 'circle',
        x,
        y,
        width: 0,
        height: 0,
        color,
        strokeWidth,
        startX: x,
        startY: y,
      };
      setCurrentElement(newElement);
    } else if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: 'text',
          x,
          y,
          text,
          color,
          strokeWidth,
        };
        setElements(prev => [...prev, newElement]);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && selectedElement && tool === 'select') {
      const dx = x - startPos.x;
      const dy = y - startPos.y;
      
      setElements(prev => prev.map(element => {
        if (element.id === selectedElement) {
          return { ...element, x: element.x + dx, y: element.y + dy };
        }
        return element;
      }));
      
      setStartPos({ x, y });
      return;
    }

    if (!isDrawing) return;

    if (tool === 'pen') {
      setElements(prev => {
        const newElements = [...prev];
        const lastElement = newElements[newElements.length - 1];
        if (lastElement && lastElement.type === 'pen') {
          lastElement.points = [...(lastElement.points || []), { x, y }];
        }
        return newElements;
      });
    } else if ((tool === 'rectangle' || tool === 'circle') && currentElement) {
      const width = x - currentElement.startX!;
      const height = y - currentElement.startY!;
      
      const updatedElement = {
        ...currentElement,
        width: tool === 'circle' ? Math.max(Math.abs(width), Math.abs(height)) : width,
        height: tool === 'rectangle' ? height : Math.max(Math.abs(width), Math.abs(height)),
        x: width < 0 ? x : currentElement.startX!,
        y: height < 0 ? y : currentElement.startY!,
      };
      
      setElements(prev => {
        const filtered = prev.filter(el => el.id !== currentElement.id);
        return [...filtered, updatedElement];
      });
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setIsDragging(false);
    if (currentElement) {
      setCurrentElement(null);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${currentWhiteboard?.name || 'whiteboard'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentWhiteboard?.name || 'Untitled Whiteboard'}
              </h1>
              <p className="text-sm text-gray-500">{currentTeam?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {currentTeam?.members.length || 0} members
              </span>
            </div>
            <button
              onClick={downloadCanvas}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all hover:scale-105"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Toolbar */}
        <div className="bg-white/80 backdrop-blur-md border-r border-gray-200/50 p-4 w-20 flex flex-col space-y-4 shadow-lg">
          {/* Tools */}
          <div className="space-y-2">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all transform hover:scale-105 ${
                  tool === t.id
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                }`}
                title={t.name}
              >
                <t.icon className="h-5 w-5" />
              </button>
            ))}
          </div>

          {/* Colors */}
          <div className="space-y-2 pt-4 border-t border-gray-200/50">
            <div className="flex items-center justify-center mb-2">
              <Palette className="h-4 w-4 text-gray-400" />
            </div>
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all mx-auto block hover:scale-110 ${
                  color === c ? 'border-gray-800 scale-110 shadow-lg' : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <div className="pt-4 border-t border-gray-200/50">
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="text-xs text-gray-500 text-center mt-1">
              {strokeWidth}px
            </div>
          </div>

          {/* Clear Button */}
          <div className="pt-4 border-t border-gray-200/50">
            <button
              onClick={clearCanvas}
              className="w-12 h-8 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition-all transform hover:scale-105"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 ${
              tool === 'select' ? 'cursor-pointer' : 
              tool === 'eraser' ? 'cursor-not-allowed' : 'cursor-crosshair'
            }`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;