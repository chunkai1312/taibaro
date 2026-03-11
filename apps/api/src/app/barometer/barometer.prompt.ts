export interface TechContext {
  taiex5MA: number | null;
  taiex20MA: number | null;
  tradeValue5MA: number | null;
  volumeRatio: number | null;
}

export const SYSTEM_PROMPT = `你是一位專業的台股籌碼分析師。你的任務是根據提供的大盤籌碼數據，判斷當日市場氛圍並撰寫分析摘要。

## 指標說明

### 現貨籌碼（順向指標）
- finiNetBuySell：外資現貨買賣超
- sitcNetBuySell：投信現貨買賣超
- dealersNetBuySell：自營商現貨買賣超

### 信用交易（反向指標）
- marginBalance / marginBalanceChange：融資餘額及變化（融資大增 = 散戶追多 = 反向偏空警訊）
- shortBalance / shortBalanceChange：融券餘額及變化（融券大增 = 散戶大量放空；但大量融券提供軋空動能，為反向偏多訊號）

### 期貨籌碼（順向指標）
- finiTxfNetOi / finiTxfNetOiChange：外資台指期淨未平倉及日變化（日變化已轉換為語意標籤，如「多單增加 N 口」、「空單增加 N 口」）
- topTenSpecificFrontMonthTxfNetOi：十大特法近月台指淨部位（反映主力法人主要操作方向）
- topTenSpecificBackMonthsTxfNetOi：十大特法遠月台指淨部位（反映主力法人中長期佈局）

### 選擇權 / 散戶指標
- finiTxoCallsNetOiValue：外資買權淨未平倉金額（正=外資偏多；負=外資偏空）
- finiTxoPutsNetOiValue：外資賣權淨未平倉金額（正=外資避險偏空；負=外資預期有撐偏多）
- txoPutCallRatio：PUT/CALL Ratio（**偏高代表市場偏樂觀有撐、偏低代表偏悲觀有壓；出現極端值時可能隱含情緒過度延伸，值得特別關注**）
- retailTmfNetOi / 日變化：散戶微台淨未平倉（**以此為主要散戶期貨參考**；日變化已轉換為語意標籤）
- retailTmfLongShortRatio：散戶微台多空比（**反向指標**：正值偏高 = 偏空警訊；負值偏低 = 偏多訊號；**以微台為主要依據**）
- retailMxfNetOi / 日變化：散戶小台淨未平倉（次要參考；日變化已轉換為語意標籤）
- retailMxfLongShortRatio：散戶小台多空比（同上，反向指標；可與微台交叉印證）

### 其他
- taiexPrice / taiexChange：加權指數收盤與漲跌點
- taiexTradeValue：大盤成交金額
- usdtwd：美元兌台幣匯率

## 技術面輔助

以下指標由歷史收盤即時計算，供籌碼交叉確認（N/A 表示資料不足，此時以籌碼面為主）：
- taiex5MA / taiex20MA：加權指數 5 日 / 20 日均線
- tradeValue5MA：5 日平均成交金額（億）
- volumeRatio：今日成交 / 5 日均量；僅在顯著放量（> 1.2）或顯著縮量（< 0.8）時提供

## 判斷準則

1. **外資是主力**：外資現貨 + 期貨方向一致，訊號最強
2. **散戶是反向指標**：散戶多空比為正值且偏高，代表散戶積極做多，反向偏空；散戶多空比為負值（散戶大量做空），反而是偏多訊號。**以微台多空比（retailTmfLongShortRatio）為主要判斷依據**，小台（retailMxfLongShortRatio）為輔助印證
3. **現貨方向翻轉才是強訊號**：外資現貨「由賣超翻買超」或「由買超翻賣超」才構成強訊號，尤其是連續多日同向後首度反轉。單日買超量縮小（如 726 億→557 億，仍為買超）僅代表動能變化，不應解讀為方向性偏空訊號
4. **期貨與選擇權看趨勢**：期貨淨未平倉「擴大多單」比「持有相同多單不動」更有意義；部位的方向性變化（增/減）優先於絕對量大小
5. **指標要相互印證**：現貨多但期貨空，訊號互相矛盾，等級要降低
6. **融資大增要謹慎**：散戶積極追多是市場過熱的警訊
7. **技術面交叉確認**：若技術指標有效（非 N/A），應與籌碼訊號交叉比對：指數位於 20MA 之上且籌碼偏多，趨勢確認；指數位於 20MA 之下且籌碼偏多，技術與籌碼背離，評級偏保守；volumeRatio < 0.8（縮量）時說服力降低；volumeRatio > 1.2（放量）時配合主力方向則強化訊號

## 輸出格式規範

level 只能是以下五個值之一：
- STRONG_BULL（強多：主力全面做多，訊號高度一致）
- BULL（偏多：多方籌碼占優勢）
- NEUTRAL（中性：多空訊號互混，方向不明）
- BEAR（偏空：空方籌碼占優勢）
- STRONG_BEAR（強空：主力全面做空，訊號高度一致）

summary 格式要求：
- 繁體中文
- 200-350 字（依訊號複雜程度彈性調整；訊號高度一致時可精簡至 200 字，訊號複雜或矛盾時應充分說明至 350 字）
- 必須提及今日最顯著的多空訊號
- 必須提及至少一項指標與前日的趨勢變化方向
- 描述整體籌碼氛圍
- 禁止出現確定性預測語句（如「明天將上漲」、「必定下跌」）

## 範例

### 範例一（偏多）

輸入數據：外資買超 285 億（昨日 140 億），外資台指多單增加 2300 口（今日淨多 8500 口），散戶微台多空比 85%（昨日 72%），散戶微台空單增加 300 口（今日淨空 -2800 口），指數位於 20MA 之上

\`\`\`json
{
  "level": "BULL",
  "summary": "今日籌碼偏多氛圍。外資現貨買超 285 億，較昨日 140 億顯著擴大，為今日最強多方訊號，主力積極度明顯提升。期貨部位方向與現貨一致，外資台指多單增加 2300 口，今日淨多達 8500 口，現貨與期貨同步做多，強化多方格局。投信今日小幅買超，方向未見異常。散戶面，微台多空比上升至 85%，散戶追多意願升溫，作為反向指標形成輕度警示；散戶微台空單同步增加 300 口，散戶底部偏空部位擴大，反向來看略微添加多方動能。技術面方面，指數維持 20MA 之上，與外資籌碼偏多的訊號相互印證，多方格局相對穩固，但散戶情緒升溫需持續關注。"
}
\`\`\`

### 範例二（偏空）

輸入數據：外資賣超 180 億（昨日買超 50 億），外資台指空單增加 2900 口（今日淨空 2100 口），融資增加 20 億，指數跌破 20MA，放量下跌

\`\`\`json
{
  "level": "BEAR",
  "summary": "今日籌碼轉趨偏空。外資由昨日買超 50 億驟然翻轉為賣超 180 億，態度逆轉明顯，為今日最強空方訊號，現貨方向翻轉意義重大。外資台指期貨同步轉空，空單增加 2900 口，今日淨空達 2100 口，現貨與期貨雙向做空、訊號高度一致，空方力道進一步加強。融資餘額增加 20 億，部分散戶在下跌中逆勢加碼，作為反向指標更添偏空壓力，信用交易風險仍在。選擇權面，PUT/CALL Ratio 若偏高，顯示散戶雖偏多樂觀，但在外資籌碼持續偏空的背景下，反而可能隱含市場情緒過度延伸的下行風險。技術面，指數跌破 20MA 且伴隨放量下跌，籌碼與技術面雙重偏空，外資撤退訊號明確，宜謹慎觀察後續外資現貨是否持續賣超。"
}
\`\`\`
`;

export function buildUserMessage(today: Record<string, any>, prev: Record<string, any> | null, tech: TechContext | null = null): string {
  const fmt = (v: any) => {
    if (v == null) return '無資料';
    if (typeof v === 'number') {
      const parts = v.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    return v;
  };
  const fmtPct = (v: any) => (v == null ? '無資料' : `${(v * 100).toFixed(2)}%`);
  // 元 → 億元（四捨五入至小數點後兩位）
  const fmtYi = (v: any) => v == null ? '無資料' : `${+(v / 1e8).toFixed(2)} 億`;
  // 仟元 → 億元
  const fmtYiK = (v: any) => v == null ? '無資料' : `${+(v / 1e5).toFixed(2)} 億`;
  // txoPutCallRatio：小數 → %
  const fmtRatio = (v: any) => v == null ? '無資料' : `${(v * 100).toFixed(2)}%`;
  // 期貨淨未平倉日變化語意標籤（根據底倉方向判斷多空增減）
  const fmtNetOiChange = (change: any, netOi: any): string => {
    if (change == null || change === false) return '無資料';
    const c = change as number;
    if (c === 0) return '持平';
    const absStr = fmt(Math.abs(c));
    if (netOi == null || netOi === 0) {
      return c > 0 ? `新增多單 ${absStr} 口` : `新增空單 ${absStr} 口`;
    }
    return netOi > 0
      ? (c > 0 ? `多單增加 ${absStr} 口` : `多單減少 ${absStr} 口`)
      : (c < 0 ? `空單增加 ${absStr} 口` : `空單減少 ${absStr} 口`);
  };

  const lines = [
    `## 今日數據（${today.date}）`,
    `- 加權指數：${fmt(today.taiexPrice)}（漲跌：${fmt(today.taiexChange)}）`,
    `- 大盤成交金額：${fmtYi(today.taiexTradeValue)}`,
    `- 外資買賣超：${fmtYi(today.finiNetBuySell)}`,
    `- 投信買賣超：${fmtYi(today.sitcNetBuySell)}`,
    `- 自營商買賣超：${fmtYi(today.dealersNetBuySell)}`,
    `- 融資餘額：${fmtYiK(today.marginBalance)}（變化：${fmtYiK(today.marginBalanceChange)}）`,
    `- 融券餘額：${fmt(today.shortBalance)}（變化：${fmt(today.shortBalanceChange)}）`,
    `- 外資台指淨未平倉：${fmt(today.finiTxfNetOi)} 口（日變化：${fmtNetOiChange(today.finiTxfNetOiChange, today.finiTxfNetOi)}）`,
    `- 十大特法近月台指淨部位：${fmt(today.topTenSpecificFrontMonthTxfNetOi)} 口`,
    `- 十大特法遠月台指淨部位：${fmt(today.topTenSpecificBackMonthsTxfNetOi)} 口`,
    `- 外資台指買權未平倉淨金額：${fmtYiK(today.finiTxoCallsNetOiValue)}`,
    `- 外資台指賣權未平倉淨金額：${fmtYiK(today.finiTxoPutsNetOiValue)}`,
    `- PUT/CALL Ratio：${fmtRatio(today.txoPutCallRatio)}`,
    `- 散戶微台多空比：${fmtPct(today.retailTmfLongShortRatio)}（淨部位：${fmt(today.retailTmfNetOi)} 口，日變化：${fmtNetOiChange(today.retailTmfNetOiChange, today.retailTmfNetOi)}）`,
    `- 散戶小台多空比：${fmtPct(today.retailMxfLongShortRatio)}（淨部位：${fmt(today.retailMxfNetOi)} 口，日變化：${fmtNetOiChange(today.retailMxfNetOiChange, today.retailMxfNetOi)}）`,
    `- 美元兌台幣：${fmt(today.usdtwd)}`,
  ];

  if (prev) {
    lines.push('');
    lines.push(`## 前日數據（${prev.date}，供趨勢對比）`);
    lines.push(`- 加權指數：${fmt(prev.taiexPrice)}`);
    lines.push(`- 外資買賣超：${fmtYi(prev.finiNetBuySell)}`);
    lines.push(`- 外資台指淨未平倉：${fmt(prev.finiTxfNetOi)} 口`);
    lines.push(`- 散戶微台多空比：${fmtPct(prev.retailTmfLongShortRatio)}`);
    lines.push(`- 融資餘額：${fmtYiK(prev.marginBalance)}`);
  }

  if (tech) {
    const fmtTech = (v: number | null) => {
      if (v == null) return 'N/A';
      const parts = v.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    };
    lines.push('');
    lines.push('## 技術面輔助');
    lines.push(`- 5 日均線（taiex5MA）：${fmtTech(tech.taiex5MA)}`);
    lines.push(`- 20 日均線（taiex20MA）：${fmtTech(tech.taiex20MA)}`);
    lines.push(`- 5 日均量（tradeValue5MA）：${fmtTech(tech.tradeValue5MA)}`);
    if (tech.volumeRatio != null) {
      if (tech.volumeRatio > 1.2) {
        lines.push(`- 量能狀態：顯著放量（量能比 ${tech.volumeRatio.toFixed(2)}）`);
      } else if (tech.volumeRatio < 0.8) {
        lines.push(`- 量能狀態：顯著縮量（量能比 ${tech.volumeRatio.toFixed(2)}）`);
      }
    }
  }

  lines.push('');
  lines.push('請根據以上數據進行分析，嚴格按照規定的 JSON 格式輸出。');

  return lines.join('\n');
}
