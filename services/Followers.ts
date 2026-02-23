import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "./Auth";

export async function followUser(targetUserId: string) {
  const user = await getCurrentUser();
  await supabase.from('followers').insert({
    follower_id: user?.id,
    following_id: targetUserId,
  });

  // Check mutual follow → create match if needed
  const { data: mutual } = await supabase
    .from('followers')
    .select('*')
    .eq('follower_id', targetUserId)
    .eq('following_id', user?.id)
    .single();

  if (mutual) {
    const { data: existingMatch } = await supabase
      .from('matches')
      .select('*')
      .or(
        `user_one.eq.${user?.id},user_two.eq.${targetUserId}`,
        `user_one.eq.${targetUserId},user_two.eq.${user?.id}`
      )
      .single();

    if (!existingMatch) {
      await supabase.from('matches').insert({
        user_one: user?.id,
        user_two: targetUserId,
      });
    }
  }
}
