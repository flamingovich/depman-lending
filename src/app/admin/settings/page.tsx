import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSiteSettings } from "@/lib/data";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Настройки сайта</h1>
        <p className="text-sm text-slate-500">
          Тексты и элементы интерфейса Mini App
        </p>
      </div>

      <SettingsForm
        initial={{
          siteName: settings.siteName,
          siteTagline: settings.siteTagline,
          heroTitle: settings.heroTitle,
          searchPlaceholder: settings.searchPlaceholder,
          promoBannerText: settings.promoBannerText,
          promoButtonText: settings.promoButtonText,
          bottomBarTitle: settings.bottomBarTitle,
          bottomBarRating: settings.bottomBarRating,
          bottomBarCtaText: settings.bottomBarCtaText,
          telegramBotUrl: settings.telegramBotUrl,
        }}
      />
    </div>
  );
}
