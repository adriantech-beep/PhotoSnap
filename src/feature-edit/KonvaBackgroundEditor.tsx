import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";
import useImage from "use-image";

interface KonvaEditorProps {
  imageUrl: string;
  onDone: (dataUrl: string) => void;
}

export default function KonvaBackgroundEditor({
  imageUrl,
}: //   onDone,
KonvaEditorProps) {
  const [image] = useImage(imageUrl);

  //   const exportCanvas = (stageRef: any) => {
  //     const dataUrl = stageRef.toDataURL();
  //     onDone(dataUrl);
  //   };

  return (
    <Stage width={640} height={480}>
      <Layer>
        {/* background replacement example */}
        <Rect width={640} height={480} fill="lightblue" />
        {image && <KonvaImage image={image} draggable />}
      </Layer>
    </Stage>
  );
}
