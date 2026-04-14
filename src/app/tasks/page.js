// "use client";

// import { PageWithSidebar } from "@/components";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useState } from "react";
// import { collection, addDoc } from "firebase/firestore";
// import { db } from "../../config";

// export default function Tasks() {
//     const [todoValue, setTodoValue] = useState("")

//     function submitTask() {
//         console.log(todoValue)
//     }

//   return (
//       <PageWithSidebar>
//         <div className="h-full flex flex-col space-y-4 items-center justify-around">
//             <div className="max-w-full w-200 h-full flex flex-col space-y-4 items-center justify-around">
//                 <div className="p-2 shadow-sm rounded-xl bg-white/50 backdrop-blur-md w-full flex justify-between items-center space-x-2">
//                     <Input placeholder="What needs to be done?" value={todoValue} onChange={(e) => setTodoValue(e.target.value)} className="py-5" />
//                     <Button className="h-full" onClick={submitTask}>Add</Button>
//                 </div>
//                 <div>hi</div>
//             </div>
//         </div>
//       </PageWithSidebar>
//   );
// }
