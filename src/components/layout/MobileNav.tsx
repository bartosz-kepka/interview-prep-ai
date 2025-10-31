import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';

export const MobileNav = ({ userEmail }: { userEmail: string | undefined }) => {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon">
					<Menu className="h-4 w-4" />
				</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Menu</SheetTitle>
					<SheetDescription>Nawigacja</SheetDescription>
				</SheetHeader>
				<div className="grid gap-4 py-4">
					<a href="/generator" className="text-sm font-medium hover:underline">
						Generator
					</a>
					{userEmail && (
						<a href="/my-questions" className="text-sm font-medium hover:underline">
							Moje pytania
						</a>
					)}
				</div>
				<div className="absolute bottom-4 flex w-[85%] flex-col items-center justify-center space-y-4">
					{userEmail && (
						<div className="flex flex-col items-center space-y-2">
							<span className="text-sm font-medium text-gray-500">{userEmail}</span>
							<LogoutButton />
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
};

