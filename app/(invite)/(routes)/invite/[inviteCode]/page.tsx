import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface InviteCodePageProps {
    params: {
        inviteCode: string;
    };
}

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
    const profile = await currentProfile();

    // Instead of returning RedirectToSignIn directly, call it to render the component
    if (!profile) {
        return <RedirectToSignIn />;
    }

    // Check if inviteCode is valid
    if (!params.inviteCode) {
        redirect("/"); // Just call redirect directly, it doesn't need to be returned
        return null; // Return null to avoid TypeScript error
    }

    // Check if the server with the given inviteCode already exists for the user
    const existingServer = await db.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
            members: {
                some: {
                    profileId: profile.id,
                },
            },
        },
    });

    // If the user is already a member of the server, redirect them
    if (existingServer) {
        redirect(`/servers/${existingServer.id}`);
        return null; // Return null to avoid TypeScript error
    }

    // Try to update the server with the new member
    const server = await db.server.update({
        where: {
            inviteCode: params.inviteCode,
        },
        data: {
            members: {
                create: [
                    {
                        profileId: profile.id,
                    },
                ],
            },
        },
    });

    // If the update was successful, redirect to the server page
    if (server) {
        redirect(`/servers/${server.id}`);
        return null; // Return null to avoid TypeScript error
    }

    return null; // Ensure a return statement for fallback
};

export default InviteCodePage;
