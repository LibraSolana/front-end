import { NextResponse } from 'next/server';
import { pinata } from 'shared/utils/pinata';

export async function POST(request: Request) {


  try {
    const data = await request.formData();
    const file = data.get('file') as File;
    const { cid } = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(cid);
    return NextResponse.json(url);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
