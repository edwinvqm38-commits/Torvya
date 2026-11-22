import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, GaugeChart, HeatmapChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, MarkLineComponent, MarkAreaComponent, MarkPointComponent, ToolboxComponent, VisualMapComponent, CalendarComponent, AriaComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { LabelLayout, UniversalTransition } from 'echarts/features';
echarts.use([BarChart, LineChart, PieChart, GaugeChart, HeatmapChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, MarkLineComponent, MarkAreaComponent, MarkPointComponent, ToolboxComponent, VisualMapComponent, CalendarComponent, AriaComponent, CanvasRenderer, LabelLayout, UniversalTransition]);
window.TrzEcharts = echarts;
