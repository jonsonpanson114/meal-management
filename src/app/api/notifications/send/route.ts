import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

// Configuration (Should be in env vars in production)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BFAqWE2Q_lhxYvPqw1SULEQUx8Go5zLZniTAo2W9oafEFZW9idYB-deF__PGl_kUXD9B-DLW1Ad8k-ioimaC9hA';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'qPSizVwzkHyKjscFoQorfrKp8w8cmEDCVOFmuN6i_Fo';

webpush.setVapidDetails(
  'mailto:example@yourdomain.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function POST(request: Request) {
  try {
    const { userId, title, body, url } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Get all subscriptions for this user
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
    }

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title: title || 'MealTrack',
              body: body || '食事を記録する時間ですよ！',
              url: url || '/add',
              tag: 'meal-reminder',
            })
          );
          return { endpoint: sub.endpoint, success: true };
        } catch (err: any) {
          console.error('Push failed for endpoint:', sub.endpoint, err);
          
          // Delete expired subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
          
          return { endpoint: sub.endpoint, success: false, error: err.message };
        }
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Trigger push error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
