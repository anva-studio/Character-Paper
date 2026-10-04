package studio.anva.characterpaper.tests;
import android.content.*;import android.database.*;import android.net.Uri;import android.os.*;import java.io.*;
public class FixtureProvider extends ContentProvider {
 public boolean onCreate(){return true;}public String getType(Uri u){return "application/json";}
 public Cursor query(Uri u,String[] p,String s,String[] a,String o){MatrixCursor c=new MatrixCursor(new String[]{"_display_name","_size"});c.addRow(new Object[]{"fixture.json",30});return c;}
 public ParcelFileDescriptor openFile(Uri u,String mode)throws FileNotFoundException{File f=new File(getContext().getCacheDir(),"fixture.json");try{try(FileOutputStream out=new FileOutputStream(f)){out.write("{\"fixture\":\"Character Paper\"}".getBytes("UTF-8"));}}catch(IOException e){throw new FileNotFoundException(e.getMessage());}return ParcelFileDescriptor.open(f,ParcelFileDescriptor.MODE_READ_ONLY);}
 public Uri insert(Uri u,ContentValues v){return null;}public int update(Uri u,ContentValues v,String s,String[] a){return 0;}public int delete(Uri u,String s,String[] a){return 0;}
}
