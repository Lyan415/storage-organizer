import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const providers = [
    {
        name: 'Google Gemini',
        tag: '推薦 - 有免費額度',
        tagColor: 'bg-green-100 text-green-700',
        cost: '免費額度：每分鐘 15 次請求（Gemini 2.0 Flash）。超過後依用量計費，圖片辨識每次約 $0.001 美元。',
        url: 'https://aistudio.google.com/apikey',
        steps: [
            '前往 Google AI Studio',
            '使用 Google 帳號登入',
            '點擊左側選單的「Get API key」',
            '點擊「Create API key」按鈕',
            '選擇一個 Google Cloud 專案（或建立新的）',
            '複製產生的 API Key',
        ],
    },
    {
        name: 'OpenAI',
        tag: '需付費',
        tagColor: 'bg-blue-100 text-blue-700',
        cost: '無免費額度，需先儲值。GPT-4o mini 圖片辨識每次約 $0.002 美元。最低儲值 $5 美元。',
        url: 'https://platform.openai.com/api-keys',
        steps: [
            '前往 OpenAI Platform',
            '註冊或登入帳號',
            '進入 Settings → Billing，加入付款方式並儲值',
            '點擊左側「API keys」',
            '點擊「Create new secret key」',
            '為 Key 取個名稱，點擊建立',
            '複製產生的 API Key（只會顯示一次）',
        ],
    },
    {
        name: 'Claude (Anthropic)',
        tag: '需付費',
        tagColor: 'bg-purple-100 text-purple-700',
        cost: '有少量免費額度（$5 美元試用）。Claude Sonnet 圖片辨識每次約 $0.003 美元。',
        url: 'https://console.anthropic.com/settings/keys',
        steps: [
            '前往 Anthropic Console',
            '註冊或登入帳號',
            '進入 Settings → API keys',
            '點擊「Create Key」',
            '為 Key 取個名稱，點擊建立',
            '複製產生的 API Key（只會顯示一次）',
        ],
    },
];

export const ApiGuidePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-10 bg-white shadow px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-bold text-gray-900">如何取得 API Key</h1>
            </header>

            <main className="max-w-lg mx-auto p-4 space-y-6 pb-12">
                <p className="text-sm text-gray-600">
                    AI 物件辨識功能需要 API Key。以下是三家主要供應商的申請方式，選擇任一家即可。
                </p>

                {providers.map((provider) => (
                    <div key={provider.name} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">{provider.name}</h2>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${provider.tagColor}`}>
                                {provider.tag}
                            </span>
                        </div>

                        <div className="p-4 space-y-3">
                            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
                                {provider.cost}
                            </div>

                            <ol className="space-y-2">
                                {provider.steps.map((step, i) => (
                                    <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                                        <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                            {i + 1}
                                        </span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>

                            <a
                                href={provider.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <ExternalLink size={14} />
                                前往申請
                            </a>
                        </div>
                    </div>
                ))}

                <div className="text-xs text-gray-400 text-center space-y-1">
                    <p>API Key 只會儲存在你的裝置上，不會上傳到任何伺服器。</p>
                    <p>你可以隨時在登入頁面更換或清除 API Key。</p>
                </div>
            </main>
        </div>
    );
};
