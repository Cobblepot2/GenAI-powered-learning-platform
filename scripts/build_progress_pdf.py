"""Build the two-page discussion handout. Requires reportlab.

Run from the repository root: python scripts/build_progress_pdf.py
Set LEARNLOOP_CJK_FONT to an available Chinese TrueType font on other systems.
"""
import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    KeepTogether, Flowable,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "learnloop-week8-9-progress.pdf"
INK = colors.HexColor("#163d36")
TEAL = colors.HexColor("#127c6d")
MUTED = colors.HexColor("#52645f")
PALE = colors.HexColor("#edf4ee")
LINE = colors.HexColor("#d7e1da")


def register_font():
    requested = os.environ.get("LEARNLOOP_CJK_FONT")
    candidates = [requested] if requested else []
    candidates += ["C:/Windows/Fonts/msyh.ttc", "C:/Windows/Fonts/simhei.ttf"]
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            try:
                pdfmetrics.registerFont(TTFont("CJK", candidate))
                return
            except Exception:
                continue
    raise RuntimeError("Set LEARNLOOP_CJK_FONT to a Chinese TrueType font path.")


register_font()
styles = {
    "title": ParagraphStyle("Title", fontName="CJK", fontSize=24, leading=32, textColor=INK, spaceAfter=8),
    "sub": ParagraphStyle("Sub", fontName="CJK", fontSize=10, leading=15, textColor=MUTED, spaceAfter=12),
    "h": ParagraphStyle("Heading", fontName="CJK", fontSize=12, leading=18, textColor=TEAL, spaceBefore=12, spaceAfter=5),
    "body": ParagraphStyle("Body", fontName="CJK", fontSize=9.2, leading=15, textColor=INK, spaceAfter=5, wordWrap="CJK"),
    "cell": ParagraphStyle("Cell", fontName="CJK", fontSize=8.6, leading=13.4, textColor=INK, wordWrap="CJK"),
    "small": ParagraphStyle("Small", fontName="CJK", fontSize=8, leading=12, textColor=MUTED, spaceAfter=4, wordWrap="CJK"),
}


def p(text, kind="body"):
    return Paragraph(text, styles[kind])


def section(title, text=None):
    items = [p(title, "h")]
    if text:
        items.append(p(text))
    return items


def table(rows, widths):
    content = [[p(str(cell), "cell") for cell in row] for row in rows]
    item = Table(content, colWidths=widths, hAlign="LEFT")
    item.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALE),
        ("LINEBELOW", (0, 0), (-1, 0), 0.7, TEAL),
        ("LINEBELOW", (0, 1), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return item


class Architecture(Flowable):
    def __init__(self):
        super().__init__()
        self.width = 174 * mm
        self.height = 24 * mm

    def draw(self):
        c = self.canv
        boxes = [(0, "学习 / 教师工作台"), (178, "课程与测验逻辑"), (356, "浏览器本地存储")]
        for x, label in boxes:
            c.setFillColor(PALE)
            c.setStrokeColor(LINE)
            c.roundRect(x, 12, 138, 43, 5, fill=1, stroke=1)
            c.setFillColor(INK)
            c.setFont("CJK", 9)
            c.drawCentredString(x + 69, 29, label)
        c.setStrokeColor(TEAL)
        for x in [145, 323]:
            c.line(x, 33, x + 26, 33)
            c.line(x + 26, 33, x + 21, 37)
            c.line(x + 26, 33, x + 21, 29)


def footer(canvas, doc):
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 17 * mm, 192 * mm, 17 * mm)
    canvas.setFont("CJK", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 12 * mm, "LearnLoop  |  第8-9周项目讨论  |  可运行原型与后续计划")
    canvas.drawRightString(192 * mm, 12 * mm, f"{doc.page} / 2")


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(OUT), pagesize=(210 * mm, 297 * mm),
                            rightMargin=18 * mm, leftMargin=18 * mm,
                            topMargin=17 * mm, bottomMargin=23 * mm,
                            title="LearnLoop - 第8-9周项目进度摘要", author="LearnLoop project")
    body = [p("LearnLoop 学习环", "title"),
            p("第8-9周进度讨论摘要  /  从互动微课程验证学习平台的核心流程", "sub")]
    body += section("01  项目目标与用户", "面向非计算机专业入门者及计算机专业学生，建设生成式 AI 辅助的互动微课程平台。初期覆盖软件开发与工程基础、AI 编程代理，以及团队协作与产品思维；后续支持教师和学习者创建其他主题的课程。")
    body.append(p("待验证假设：分步内容、情境练习与即时反馈能帮助不同背景的学习者更顺利入门；教师需要便于修改的课程草稿和可解释的参与记录。当前尚未完成用户访谈，不将上述假设视为调研结论。", "small"))
    body += section("02  当前原型：可完整走通的学习闭环")
    body.append(table([
        ["模块", "已实现的演示内容", "当前边界"],
        ["课程与学习", "3门微课；课程内容、情境单选、即时反馈与学习进度。", "为本地示例课程，尚未进行教学效果验证。"],
        ["教师编辑", "按主题、背景和目标生成规则模板草稿；手动编辑并发布到课程库。", "规则模板演示，未接入真实大模型。"],
        ["参与记录", "根据当前浏览器的学习事件展示参与情况。", "仅此浏览器数据，不能代表班级或多人统计。"],
        ["运行与材料", "无前端依赖的浏览器原型；运行说明、需求、架构、验收与讨论材料。", "本阶段先验证交互与范围；正式部署另行完成。"],
    ], [27 * mm, 87 * mm, 60 * mm]))
    body += section("03  技术设计：先验证交互，再接入服务")
    body.append(Architecture())
    body.append(p("当前：HTML / CSS / JavaScript 实现交互，以 localStorage 保存课程、进度和事件；无需 API 密钥即可演示。未来：增加后端 API、账户和权限、数据库及服务端模型调用，保留教师审核后发布的步骤。", "small"))
    body += section("04  课堂演示路线（约3分钟）", "选一门微课 → 阅读内容并回答场景题 → 查看反馈与进度 → 切换教师工作台，生成并编辑草稿 → 发布到课程库 → 查看本浏览器产生的参与记录。")
    body.append(p("证据与透明度：原型和材料由 AI 辅助搭建；代码、测试及核对记录可在仓库复核。尚未收集真实用户反馈，也未形成个人贡献记录。", "small"))
    body.append(PageBreak())
    body.append(p("下一阶段如何验证", "title"))
    body.append(p("本次讨论重点：范围是否合适、如何验证价值、哪些功能应优先完成。", "sub"))
    body += section("05  从第8-9周推进到最终提交")
    body.append(table([
        ["阶段", "主要工作", "验收证据"],
        ["第8-9周讨论", "演示当前流程；与老师确认核心需求、原型范围与评分口径。", "两页摘要、原型、需求与问题清单。"],
        ["讨论后 / 第9周", "邀请不同背景的学习者和教师体验；记录完成任务的情况、疑惑与改进建议。", "匿名记录、任务完成情况和修改前后对照；目前均待执行。"],
        ["第10周", "实现服务端 AI、课程结构校验、教师审核、账户权限和共享数据；根据反馈调整体验。", "真实模型调用演示、权限与持久化测试、迭代记录。"],
        ["第11周", "公开部署；完成5-8分钟视频、报告、幻灯片和管理员 / 教师 / 学生手册。", "公开链接、可复现运行步骤与最终提交材料。"],
        ["第12-13周", "展示系统与开发过程，分享 AI 使用方法、挑战和反思。", "暂定最多8分钟展示、约5分钟问答；以老师确认安排为准。"],
    ], [31 * mm, 84 * mm, 59 * mm]))
    body += section("06  用户验证方案（待执行）", "建议邀请至少2名不同背景学习者及1名教师。学习者完成“找课、做题、理解反馈”任务；教师完成“创建、修改、发布课程”任务。记录是否独立完成、用时、卡点及原话，避免只问是否喜欢。访谈脚本和空白记录表见 docs/user-validation.md。")
    body += section("07  风险与AI协作方法", "优先处理：课程内容错误、生成质量不稳定、本地数据无法跨账户共享，以及范围扩张。正式版通过结构校验、教师审核、权限控制和分阶段验收处理；API 密钥只保存在服务端。")
    body.append(p("AI Fluency 4D：Delegation - 把草稿与重复编码交给 AI；Description - 明确目标、约束和验收条件；Discernment - 审查内容、代码与实际体验；Diligence - 测试、记录来源并对交付负责。当前已采用需求约束、代码核对和测试，用户验证仍需补足。", "small"))
    body += section("08  希望在讨论中确认", "① 当前微课及互动深度是否符合预期？ ② 最终版真实 AI 与多人管理应达到什么程度？ ③ 是否优先完成学习闭环和教师审核，再扩展到其他学科？ ④ 评分表中系统功能40%与暂定 rubric 35%的差异，以哪个为准？")
    body.append(Spacer(1, 6))
    body.append(p("依据：课程 Project Overview 第1-4页。进度讨论约5-10分钟，占项目成绩5%。原文组队日期存在日期 / 星期矛盾，本材料仅按教学周安排。", "small"))
    doc.build(body, onFirstPage=footer, onLaterPages=footer)
    print(OUT)


if __name__ == "__main__":
    build()
