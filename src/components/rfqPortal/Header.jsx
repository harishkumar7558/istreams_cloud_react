import logoDark from "@/assets/logo-dark.png";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    Bell,
    ChevronDown,
    FileText,
    HelpCircle,
    Menu
} from "lucide-react";


function Header() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}

      className=" bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
      <header className="sticky top-0 z-50 w-full  bg-white/95 backdrop-blur shadow-md">
        <div className="flex h-16 items-center justify-between bg-zinc-900 px-4 text-white">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white/20 p-1">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                RFQ Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute right-1 top-1 h-4 w-4 justify-center p-0 bg-pink-600 text-white">
                3
              </Badge>
            </Button>

            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 rounded-full border border-white/20 p-1 pr-3 bg-white/10 shadow">
              <Avatar className="h-8 w-8">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:block">
                John Doe
              </span>
              <ChevronDown className="hidden h-4 w-4 text-white/70 sm:block" />
            </div>
            <div className="h-8 w-20">
              <img src={logoDark} alt="Logo" className="h-8 w-20" />
            </div>
          </div>
        </div>
      </header>
    </motion.div>
  )
}

export default Header
