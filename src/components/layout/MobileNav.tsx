import {
	Sheet,
	SheetContent,
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
				</SheetHeader>
				<div className="flex flex-col items-center space-y-6 py-8">
					<a
						href="/"
						className="text-lg font-semibold text-foreground transition-colors hover:text-foreground/80"
					>
						Moje pytania
					</a>
					<a
						href="/generator"
						className="text-lg font-semibold text-foreground transition-colors hover:text-foreground/80"
					>
						Generator
					</a>
				</div>
				<div className="absolute bottom-8 flex w-[85%] flex-col items-center justify-center space-y-4">
					<span className="text-sm font-medium text-muted-foreground">{userEmail}</span>
					<LogoutButton />
				</div>
			</SheetContent>
		</Sheet>
	);
};

