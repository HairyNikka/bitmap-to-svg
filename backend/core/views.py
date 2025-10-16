from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import cairosvg

@csrf_exempt
def svg_to_pdf(request):
    if request.method == 'POST':
        svg_data = request.body
        pdf_bytes = cairosvg.svg2pdf(bytestring=svg_data)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="converted.pdf"'
        return response
    return HttpResponse("Only POST allowed", status=405)

@csrf_exempt
def svg_to_eps(request):
    if request.method == 'POST':
        svg_data = request.body
        eps_bytes = cairosvg.svg2eps(bytestring=svg_data)
        response = HttpResponse(eps_bytes, content_type='application/postscript')
        response['Content-Disposition'] = 'attachment; filename="converted.eps"'
        return response
    return HttpResponse("Only POST allowed", status=405)